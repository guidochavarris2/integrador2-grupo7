import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = "http://127.0.0.1:8080";
await mkdir("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function shot(page, name) {
  await page.screenshot({ path: `/workspace/screenshots/${name}.png`, fullPage: true });
}

async function login(page, email, password) {
  await page.goto(base + "/login", { waitUntil: "networkidle" });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL("**/dashboard", { timeout: 8000 });
}

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (e) => errors.push("pageerror " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console " + m.text());
  });

  // 1. Operador login
  await login(page, "carlos.mendoza@rentamax.pe", "RentaMax2026");
  await page.waitForTimeout(400);
  const opText = await page.locator("body").innerText();
  if (!/Operador de piso/i.test(opText)) errors.push("operador: no ve su rol");
  if (/Registrar equipo/i.test(opText)) errors.push("operador: ve alta de equipo");
  if (await page.getByRole("link", { name: "Seguridad" }).count()) {
    errors.push("operador: ve nav Seguridad");
  }
  await shot(page, "sec-01-operador-dashboard");

  // DNI masked on dashboard late table
  if (await page.getByText("DNI 45678912").count()) {
    errors.push("operador: DNI completo visible");
  }
  const masked = await page.getByText(/DNI 45\*\*\*\*12/).count();
  if (!masked) errors.push("operador: DNI no enmascarado");

  // 2. Direct /inventario/nuevo forbidden
  await page.goto(base + "/inventario/nuevo", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const forb = await page.locator("body").innerText();
  if (!/Acceso restringido|no corresponde/i.test(forb)) {
    errors.push("operador: no bloqueó /inventario/nuevo");
  }
  await shot(page, "sec-02-operador-forbidden");

  // 3. Help
  await page.getByRole("link", { name: "Ayuda", exact: true }).click();
  await page.waitForURL("**/ayuda");
  await page.getByRole("heading", { name: /Ayuda y soluciones/ }).waitFor({ timeout: 5000 });
  const help = await page.locator("body").innerText();
  if (!/Problemas y cómo resolverlos/i.test(help)) errors.push("ayuda incompleta");
  await shot(page, "sec-03-ayuda");

  // 4. Logout and login admin
  await page.getByRole("button", { name: /Salir/ }).click();
  await page.waitForURL("**/login");
  await login(page, "admin@rentamax.pe", "Admin2026");
  await page.waitForTimeout(400);
  const ad = await page.locator("body").innerText();
  if (!/Administración/i.test(ad)) errors.push("admin: no ve rol");
  if (!/Registrar equipo/i.test(ad)) errors.push("admin: no ve alta equipo");
  await shot(page, "sec-04-admin-dashboard");

  await page.getByRole("link", { name: "Seguridad" }).click();
  await page.waitForURL("**/seguridad");
  const sec = await page.locator("body").innerText();
  if (!/Bitácora/i.test(sec)) errors.push("seguridad sin bitácora");
  if (!/login_ok|Acceso/i.test(sec)) errors.push("seguridad sin evento de login");
  await shot(page, "sec-05-bitacora");

  // 5. Supervisora sees alta, not seguridad
  await page.getByRole("button", { name: /Salir/ }).click();
  await page.waitForURL("**/login");
  await login(page, "ana.silva@rentamax.pe", "RentaMax2026");
  await page.waitForTimeout(300);
  if (await page.getByRole("link", { name: "Seguridad" }).count()) {
    errors.push("supervisora: ve Seguridad");
  }
  await page.goto(base + "/inventario/nuevo", { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  const alta = await page.locator("body").innerText();
  if (!/Registrar equipo/i.test(alta)) errors.push("supervisora: no entra a alta");
  await shot(page, "sec-06-supervisora-alta");

  // 6. Failed login
  await page.getByRole("button", { name: /Salir/ }).click();
  await page.waitForURL("**/login");
  await page.fill("#email", "carlos.mendoza@rentamax.pe");
  await page.fill("#password", "wrong");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForTimeout(400);
  const fail = await page.locator("[role=alert]").innerText();
  if (!/incorrectos/i.test(fail)) errors.push("login fail sin mensaje: " + fail);
  await shot(page, "sec-07-login-fail");

  // 7. Mobile operador
  await login(page, "carlos.mendoza@rentamax.pe", "RentaMax2026");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await shot(page, "sec-08-mobile");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  if (overflow) errors.push("mobile overflow");

  await page.close();
} catch (e) {
  errors.push("exception " + e.message);
}

await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
if (errors.length) process.exit(1);
