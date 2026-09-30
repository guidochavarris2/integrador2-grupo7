package pe.utp.rentamax;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Punto de entrada: arranca Tomcat embebido y escanea todas las capas de pe.utp.rentamax. */
@SpringBootApplication
public class RentaMaxApplication {
    public static void main(String[] args) {
        SpringApplication.run(RentaMaxApplication.class, args);
    }
}
