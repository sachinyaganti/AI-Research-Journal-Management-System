package com.researchjournal.dto;

import com.researchjournal.entity.Role;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private boolean active;

    public UserResponse(
            Long id,
            String fullName,
            String email,
            Role role,
            boolean active
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }
}