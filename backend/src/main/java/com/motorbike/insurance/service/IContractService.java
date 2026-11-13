package com.motorbike.insurance.service;

import com.motorbike.insurance.dto.request.ContractCreateRequest;
import com.motorbike.insurance.dto.request.ContractUpdateRequest;
import com.motorbike.insurance.dto.response.ContractResponse;
import java.time.LocalDate;
import java.util.List;

public interface IContractService {
    List<ContractResponse> getMyContracts();

    List<ContractResponse> getAllContract();

    ContractResponse getContractDetail(Integer contractId);

    ContractResponse createContract(ContractCreateRequest request);

    ContractResponse updateContract(Integer contractId, ContractUpdateRequest request);

    ContractResponse updateStatus(Integer contractId, String status);

    ContractResponse renewContract(Integer contractId, LocalDate startDate, LocalDate endDate, Integer packageId);

    ContractResponse softDelete(Integer contractId, String cancelReason);
}