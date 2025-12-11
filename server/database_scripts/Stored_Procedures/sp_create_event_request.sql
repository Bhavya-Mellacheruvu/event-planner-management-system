DELIMITER $$

CREATE PROCEDURE sp_create_event_request(
    IN p_client_id INT,
    IN p_event_name VARCHAR(100),
    IN p_event_desc VARCHAR(300),
    IN p_city VARCHAR(255),
    IN p_theme VARCHAR(255),
    IN p_budget DECIMAL(10, 2),
    IN p_request_type_id INT,
    IN p_event_startDate DATETIME,
    IN p_guest_count INT,
    IN p_notes TEXT
)
BEGIN
    INSERT INTO event_request (
        client_id,
        event_request_name,
        event_request_desc,
        city,
        theme_pref,
        overall_budget,
        request_type_id,
        event_start_date,
        guest_count,
        notes,
        status,
        created_at
    )
    VALUES (
        p_client_id,
        p_event_name,
        p_event_desc,
        p_city,
        p_theme,
        p_budget,
        p_request_type_id, 
        p_event_startDate,
        p_guest_count,
        p_notes,
        'Pending',
        NOW()
    );

    SELECT LAST_INSERT_ID() AS request_id;
END$$

DELIMITER ;
