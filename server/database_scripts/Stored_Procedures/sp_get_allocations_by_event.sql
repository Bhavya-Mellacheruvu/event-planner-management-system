DELIMITER $$

CREATE PROCEDURE sp_get_allocations(IN p_event_id INT)
BEGIN
    SELECT 
        a.allocation_id,
        a.vendor_id,
        v.vendor_name,
        v.service_type,
        a.contract_amount,
        a.date_assigned
    FROM allocation a
    JOIN vendor v ON v.vendor_id = a.vendor_id
    WHERE a.event_id = p_event_id;
END $$

DELIMITER ;
