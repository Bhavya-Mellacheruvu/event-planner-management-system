-- DATABASE: event_planner
DROP DATABASE IF EXISTS event_planner;
CREATE DATABASE event_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE event_planner;

-- Users (superclass)
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('client','manager') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Client (subtype) - PK is user_id (1:1 with users)
CREATE TABLE client (
  client_id INT PRIMARY KEY,                    -- maps to users.user_id
  personal_details VARCHAR(255),
  FOREIGN KEY (client_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Event Manager (subtype) - PK is user_id (1:1 with users)
CREATE TABLE event_manager (
  manager_id INT PRIMARY KEY,                   -- maps to users.user_id
  experience VARCHAR(255),
  specialization VARCHAR(255),
  FOREIGN KEY (manager_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Vendor
CREATE TABLE vendor (
  vendor_id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_name VARCHAR(150) NOT NULL,
  service VARCHAR(100) NOT NULL,
  contact_info VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Event Request (submitted by a client; optional assigned manager)
CREATE TABLE event_request (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('Pending','Approved','Rejected','Completed') NOT NULL DEFAULT 'Pending',
  city VARCHAR(100),
  theme_pref VARCHAR(150),
  overall_budget DECIMAL(12,2) DEFAULT 0.00,
  client_id INT NOT NULL,
  manager_id INT DEFAULT NULL,
  event_start_date DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES client(client_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES event_manager(manager_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_er_client (client_id),
  INDEX idx_er_manager (manager_id),
  INDEX idx_er_status (status)
) ENGINE=InnoDB;

-- Event (created/confirmed from an Event Request)
CREATE TABLE event (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  event_description VARCHAR(300) NOT NULL,
  request_id INT NOT NULL,
  event_type VARCHAR(50),
  guest_count INT,
  start_date DATETIME,
  approved_budget DECIMAL(12,2),
  FOREIGN KEY (request_id) REFERENCES event_request(request_id)
    ON DELETE CASCADE
);

-- Allocation (many-to-many between event and vendor) with attributes
CREATE TABLE IF NOT EXISTS `event_planner`.`allocation` (
  `allocation_id` INT NOT NULL AUTO_INCREMENT,
  `event_id` INT NOT NULL,
  `vendor_id` INT NOT NULL,
  `contract_amount` DECIMAL(12,2) NULL DEFAULT NULL,
  `date_assigned` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`allocation_id`),
  UNIQUE INDEX `uniq_event_vendor` (`event_id` ASC, `vendor_id` ASC) VISIBLE,
  UNIQUE INDEX `unique_event_vendor` (`event_id` ASC, `vendor_id` ASC) VISIBLE,
  INDEX `vendor_id` (`vendor_id` ASC) VISIBLE,
  CONSTRAINT `allocation_ibfk_1`
    FOREIGN KEY (`event_id`)
    REFERENCES `event_planner`.`event` (`event_id`),
  CONSTRAINT `allocation_ibfk_2`
    FOREIGN KEY (`vendor_id`)
    REFERENCES `event_planner`.`vendor` (`vendor_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 24
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;