package com.locninh.smilefofast.auth;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class AppUserRepository {
    private final JdbcTemplate jdbcTemplate;

    public AppUserRepository(@Qualifier("integrationJdbcTemplate") JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<AppUser> findByUsername(String username) {
        String sql = """
                SELECT Id, Username, PasswordHash, FullName, IsActive
                FROM dbo.AppUser
                WHERE Username = ?
                """;
        List<AppUser> rows = jdbcTemplate.query(sql, (rs, rowNum) -> new AppUser(
                rs.getInt("Id"),
                rs.getString("Username"),
                rs.getString("PasswordHash"),
                rs.getString("FullName"),
                rs.getBoolean("IsActive")
        ), username);
        return rows.stream().findFirst();
    }

    public void create(String username, String passwordHash, String fullName) {
        jdbcTemplate.update("""
                INSERT INTO dbo.AppUser (Username, PasswordHash, FullName, IsActive)
                VALUES (?, ?, ?, 1)
                """, username, passwordHash, fullName);
    }
}
