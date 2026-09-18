package com.locninh.smilefofast.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class IntegrationDataSourceConfig {

    @Bean(name = "integrationDataSource")
    @ConfigurationProperties(prefix = "integration.datasource")
    public HikariDataSource integrationDataSource() {
        return new HikariDataSource();
    }

    @Bean(name = "integrationJdbcTemplate")
    public JdbcTemplate integrationJdbcTemplate(
            @Qualifier("integrationDataSource")
            HikariDataSource dataSource
    ) {
        return new JdbcTemplate(dataSource);
    }
}