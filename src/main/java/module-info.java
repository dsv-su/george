// This is only here to reduce the size of the classpath available for IDE assistance during development
module se.su.dsv.george {
    requires java.sql;

    requires jakarta.servlet;

    requires spring.boot;
    requires spring.boot.autoconfigure;
    requires spring.context;
    requires spring.core;
    requires spring.jdbc;
    requires spring.security.config;
    requires spring.security.core;
    requires spring.security.web;
    requires spring.web;
    requires spring.websocket;
    requires spring.webmvc;

    requires com.fasterxml.jackson.databind;

    requires org.springdoc.openapi.common;
    requires io.swagger.v3.oas.models;
    requires io.swagger.v3.oas.annotations;
}
