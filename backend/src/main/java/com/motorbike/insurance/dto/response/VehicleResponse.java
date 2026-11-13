package com.motorbike.insurance.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleResponse {
    Integer vehicleId;
    String vehicleName;
    String plateNumber;
    String brandName;
    String categoryName;
    String engineNumber;
    String chassisNumber;
    Short manufactureYear;
    Boolean hasActiveInsurance;
    String activeCardNumber;
}