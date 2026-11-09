package com.motorbike.insurance.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    public int code = 1000;
    public String message;
    public T result;
}
