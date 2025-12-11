DELIMITER $$

CREATE PROCEDURE sp_allocate_vendor(
    IN p_event_id INT,
    IN p_vendor_id INT,
    IN p_amount DECIMAL(12,2)
)
BEGIN
    INSERT INTO allocation (event_id, vendor_id, contract_amount)
    VALUES (p_event_id, p_vendor_id, p_amount);

    SELECT 'Vendor allocated successfully' AS message;
END $$

DELIMITER ;
