package com.example.mymed.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // disabilita CSRF
                .csrf(csrf -> csrf.disable())

                // disabilita completamente il login di Spring
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // consenti TUTTO
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}