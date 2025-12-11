DELIMITER $$
CREATE PROCEDURE `sp_update_event_request`(
    IN p_request_id INT,
    IN p_event_name VARCHAR(100),
    IN p_event_desc VARCHAR(300),
    IN p_city VARCHAR(100),
    IN p_request_type_id INT,
    IN p_theme_pref VARCHAR(100),
    IN p_guest_count INT,
    IN p_overall_budget INT,
    IN p_notes TEXT,
    IN p_event_start_date DATE
)
BEGIN
    UPDATE event_request
    SET 
        event_request_name = p_event_name,
        event_request_desc = p_event_desc,
        city = p_city,
        request_type_id = p_request_type_id,  -- updated FK
        theme_pref = p_theme_pref,
        guest_count = p_guest_count,
        overall_budget = p_overall_budget,
        notes = p_notes,
        event_start_date = p_event_start_date
    WHERE request_id = p_request_id
      AND status = 'Pending';
END$$
DELIMITER ;
