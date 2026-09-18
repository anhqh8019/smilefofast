package com.locninh.smilefofast.auth;

public record AppUser(
        Integer id,
        String username,
        String passwordHash,
        String fullName,
        Boolean active
) {}
