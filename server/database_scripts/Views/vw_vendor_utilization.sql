
CREATE OR REPLACE VIEW vw_vendor_utilization AS
SELECT 
    v.vendor_id,
    v.vendor_name,
    v.service,
    COUNT(a.allocation_id) AS event_count,
    SUM(a.contract_amount) AS total_amount
FROM vendors v
LEFT JOIN allocations a ON v.vendor_id = a.vendor_id
GROUP BY v.vendor_id;

SELECT * FROM vw_vendor_utilization;