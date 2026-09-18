package com.locninh.smilefofast.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SmileFoDataSourceConfig {

    @Bean(name = "smileFoDataSource")
    @ConfigurationProperties(prefix = "smile-fo.datasource")
    public HikariDataSource smileFoDataSource() {
        return new HikariDataSource();
    }

    @Bean(name = "smileFoJdbcTemplate")
    public JdbcTemplate smileFoJdbcTemplate(
            @Qualifier("smileFoDataSource")
            HikariDataSource dataSource
    ) {
        return new JdbcTemplate(dataSource);
    }
}