DELIMITER $$
CREATE PROCEDURE sp_get_vendor_by_id(IN p_vendor_id INT)
BEGIN
  SELECT vendor_id, vendor_name, service, contact_info, created_at
  FROM vendor
  WHERE vendor_id = p_vendor_id;
END $$
DELIMITER ;
