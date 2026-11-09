package com.motorbike.insurance.service;

import com.motorbike.insurance.dto.request.CompensationDecisionRequest;
import com.motorbike.insurance.dto.response.CompensationResponse;
import java.util.List;

public interface ICompensationService {
    List<CompensationResponse> getAllCompensation(String status);

    CompensationResponse getCompensationDetail(Integer compensationId);

    CompensationResponse createCompensation(CompensationDecisionRequest request);

    CompensationResponse resolveCompensation(Integer compensationId, CompensationDecisionRequest request);

    CompensationResponse rejectCompensation(Integer compensationId, CompensationDecisionRequest request);

    void softDelete(Integer compensationId);
}