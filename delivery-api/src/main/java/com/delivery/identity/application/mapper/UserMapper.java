package com.delivery.identity.application.mapper;

import com.delivery.identity.application.dto.UserResponse;
import com.delivery.identity.domain.entity.User;
import com.delivery.shared.security.UserPrincipal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "active", source = "active")
    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "tenantId", source = "tenantId")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "role", expression = "java(com.delivery.identity.domain.entity.Role.valueOf(principal.getRole()))")
    @Mapping(target = "active", source = "active")
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    UserResponse toResponseFromPrincipal(UserPrincipal principal);
}
