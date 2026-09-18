package com.locninh.smilefofast.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {
    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.username:}")
    private String username;

    @Value("${app.bootstrap.password:}")
    private String password;

    @Value("${app.bootstrap.full-name:Administrator}")
    private String fullName;

    public AdminBootstrap(AppUserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return;
        }
        if (repository.findByUsername(username.trim()).isEmpty()) {
            repository.create(username.trim(), passwordEncoder.encode(password), fullName);
            System.out.println("Created initial AppUser: " + username.trim());
        }
    }
}
