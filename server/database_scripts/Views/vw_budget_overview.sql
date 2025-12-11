CREATE OR REPLACE VIEW vw_budget_overview AS
SELECT 
    r.request_id,
    r.overall_budget,
    IFNULL(SUM(a.contract_amount), 0) AS allocated_budget,
    (r.overall_budget - IFNULL(SUM(a.contract_amount), 0)) AS difference
FROM event_request r
LEFT JOIN events e ON r.request_id = e.request_id
LEFT JOIN allocations a ON e.event_id = a.event_id
GROUP BY r.request_id;
