DELIMITER $$

CREATE PROCEDURE sp_create_event(
    IN p_request_id INT,
    IN p_event_type VARCHAR(50),
    IN p_event_description VARCHAR(300),
    IN p_venue VARCHAR(150),
    IN p_guest_count INT,
    IN p_start_date DATETIME,
    IN p_budget DECIMAL(12,2)
)
BEGIN
    INSERT INTO event (request_id, event_type, event_description, venue, guest_count, start_date, approved_budget,created_at)
    VALUES (p_request_id, p_event_type, p_event_description, p_venue,  p_guest_count, p_start_date, p_budget, NOW());

    SELECT LAST_INSERT_ID() AS event_id;
END $$

DELIMITER ;
