package com.quantforge.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerLoginAndFetchProfile() throws Exception {
        String registerBody = """
                {"email": "mariam@example.com", "displayName": "Mariam", "password": "hunter2quant"}
                """;
        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content(registerBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.displayName").value("Mariam"));

        // duplicate email is rejected
        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content(registerBody))
                .andExpect(status().isConflict());

        String loginBody = """
                {"email": "mariam@example.com", "password": "hunter2quant"}
                """;
        String response = mockMvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content(loginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = com.jayway.jsonpath.JsonPath.read(response, "$.token");

        mockMvc.perform(get("/api/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("mariam@example.com"))
                .andExpect(jsonPath("$.xp").value(0))
                .andExpect(jsonPath("$.level").value(1));
    }

    @Test
    void rejectsBadCredentialsAndMissingToken() throws Exception {
        mockMvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON)
                        .content("{\"email\": \"nobody@example.com\", \"password\": \"nope12345\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/me")).andExpect(status().isForbidden());
    }

    @Test
    void rejectsShortPassword() throws Exception {
        mockMvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON)
                        .content("{\"email\": \"a@b.com\", \"displayName\": \"A\", \"password\": \"short\"}"))
                .andExpect(status().isBadRequest());
    }
}
