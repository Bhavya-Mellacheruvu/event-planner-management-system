DELIMITER $$

CREATE PROCEDURE sp_update_allocation_status(
    IN p_alloc_id INT,
    IN p_status ENUM('Assigned','In Progress','Completed')
)
BEGIN
    UPDATE allocation 
    SET status = p_status
    WHERE allocation_id = p_alloc_id;
END $$

DELIMITER ;
