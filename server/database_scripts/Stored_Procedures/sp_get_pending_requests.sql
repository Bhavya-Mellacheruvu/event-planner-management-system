DELIMITER $$

CREATE PROCEDURE sp_get_pending_requests()
BEGIN
    SELECT 
    er.request_id,
        er.event_request_name,
        er.event_request_desc,
        er.city,
        er.theme_pref,
        er.overall_budget,
        er.client_id,
        er.request_id,
        er.event_start_date,
        er.created_at,
        r.type_name,
        er.guest_count,
        er.manager_id,
        er.notes,
        er.status,
    u.name AS client_name
    FROM event_request er
    JOIN users u ON u.user_id = er.client_id
    JOIN request_type r ON er.request_type_id = r.request_type_id
    WHERE er.status = 'Pending';
END
DELIMITER;