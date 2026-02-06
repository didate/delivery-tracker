package com.delivery.identity.api;

import com.delivery.identity.application.dto.RegisterUserRequest;
import com.delivery.identity.application.dto.UpdateUserRequest;
import com.delivery.identity.application.dto.UserResponse;
import com.delivery.identity.application.mapper.UserMapper;
import com.delivery.identity.domain.entity.User;
import com.delivery.identity.domain.service.UserService;
import com.delivery.shared.security.CurrentUser;
import com.delivery.shared.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping
    @Operation(summary = "Get all users for current tenant")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<User> users = userService.getAllUsers(pageable);
        Page<UserResponse> response = users.map(userMapper::toResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getCurrentUser(@CurrentUser UserPrincipal currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @PostMapping
    @Operation(summary = "Create a new user")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody RegisterUserRequest request) {
        User user = userService.createUser(
                request.getEmail(),
                request.getPassword(),
                request.getName(),
                request.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toResponse(user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing user")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        User user = userService.updateUser(
                id,
                request.getName(),
                request.getRole(),
                request.getActive()
        );
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate a user")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<UserResponse> activateUser(@PathVariable UUID id) {
        userService.activateUser(id);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a user")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userMapper.toResponse(user));
    }
}
