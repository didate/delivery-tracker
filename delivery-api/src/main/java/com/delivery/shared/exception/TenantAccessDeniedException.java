package com.delivery.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class TenantAccessDeniedException extends RuntimeException {

    public TenantAccessDeniedException() {
        super("Access denied: You don't have permission to access this resource");
    }

    public TenantAccessDeniedException(String message) {
        super(message);
    }
}
