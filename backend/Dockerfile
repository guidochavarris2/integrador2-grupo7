# =====================================================================
# RentaMax Backend — imagen Docker multi-etapa (la construye Render en la nube)
# Etapa 1: compila con Maven y genera el .jar.  Etapa 2: solo Java + el .jar (imagen liviana).
# No hace falta tener Docker instalado en tu laptop.
# =====================================================================

# ---------- Etapa 1: compilar ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

# ---------- Etapa 2: ejecutar ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
# Buena practica: no ejecutar como root
RUN useradd --system --uid 1001 rentamax
COPY --from=build /app/target/rentamax-backend.jar app.jar
USER rentamax

# Perfil de produccion: exige todas las variables de entorno (DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET, CORS_ORIGINS)
ENV SPRING_PROFILES_ACTIVE=prod
# Memoria ajustada al plan gratuito de Render (512 MB)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xss512k"

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
