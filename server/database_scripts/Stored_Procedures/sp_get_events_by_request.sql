DELIMITER $$

CREATE PROCEDURE sp_get_events_by_request(IN p_request_id INT)
BEGIN
    SELECT 
    event_id,
    event_description,
    request_id,
    event_type,
    venue,
    guest_count,
    start_date,
    approved_budget
    FROM event WHERE request_id = p_request_id;
END $$

DELIMITER ;
