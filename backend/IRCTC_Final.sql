CREATE DATABASE IF NOT EXISTS IRCTC_DB9;
USE IRCTC_DB9;
SHOW DATABASES;

use IRCTC_DB9;

CREATE TABLE Station (
    StationID INT PRIMARY KEY auto_increment, 
    StationName VARCHAR(100) UNIQUE  NOT NULL,        
    City VARCHAR(100) NOT NULL,               
    State VARCHAR(100) NOT NULL               
);


CREATE TABLE LoginDetails (
    LoginID INT PRIMARY KEY AUTO_INCREMENT,  -- Unique ID for each user
    LoginName VARCHAR(50) NOT NULL,  
    Password VARCHAR(50) NOT NULL,       
    ContactNumber VARCHAR(10) UNIQUE NOT NULL,  
    Email VARCHAR(50) UNIQUE NOT NULL,
    UserType ENUM('Admin', 'Passenger') NOT NULL    
);

CREATE TABLE Passenger (
    PassengerID INT PRIMARY KEY auto_increment,
    LoginID INT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL, 
    AadharNO VARCHAR(50) UNIQUE NOT NULL,
    Gender CHAR(1) CHECK (Gender IN ('M', 'F', 'O')),
    Age INT,   
    DOB DATE,
    FOREIGN KEY (LoginID) REFERENCES LoginDetails(LoginID) -- Fixed incorrect reference (UserID → LoginID)
);


CREATE TABLE Train (
    TrainID INT PRIMARY KEY,
    TrainName VARCHAR(100) UNIQUE NOT NULL,
    TotalSeats INT,
    Source_Station INT,
    Destination_Station INT,
    DepartureTime TIME,  
    ArrivalTime TIME, 
    foreign key(Source_Station) references Station(StationId),
    foreign key(Destination_Station) references Station(StationID)
);

CREATE TABLE TrainAvailability(
	TrainID INT, 
    TravelDate DATE, 
    CoachID INT, 
    Price INT Check (Price>=0),
    AvailableSeats INT Check(AvailableSeats>=0), 
    Primary key(TrainID, TravelDate, CoachID)
);



CREATE TABLE Coach (
    CoachID INT PRIMARY KEY auto_increment,  
    CoachName VARCHAR(10) UNIQUE NOT NULL
);


CREATE TABLE Route (
    TrainID INT NOT NULL, 
	StationID INT NOT NULL,            
	SequenceNumber INT NOT NULL, 
    ArrivalTime TIME NOT NULL, 
    PRIMARY KEY(TrainID, SequenceNumber), 
    FOREIGN KEY (StationID) REFERENCES Station(StationID),
    FOREIGN KEY (TrainID) REFERENCES Train(TrainID)
);

CREATE TABLE Transactions
(
	LoginID INT NOT NULL, 
    TransactionID INT auto_increment primary key,
    PaymentMean Varchar(20) CHECK(PaymentMean IN ('Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallet')),
    Amount Decimal(10, 2)
);


CREATE TABLE Booking(
    TicketID INT PRIMARY KEY auto_increment,
    TransactionID INT NOT NULL, 
    PassengerID INT NOT NULL,
    TrainID INT NOT NULL,
    LoginID INT NOT NULL, 
    CoachID INT NOT NULL, 
    BookingDate DATETIME,
    BookingStatus ENUM('CONFIRMED','WAITING','CANCELLED') DEFAULT 'WAITING',
    RefundStatus VARCHAR(20) CHECK (RefundStatus IN ('Not requested', 'Pending', 'Processed')),
    Source INT NOT NULL, 
    TravelDate DATE, 
    Destination INT NOT NULL,
    FOREIGN KEY (LoginID) REFERENCES LoginDetails(LoginID),
    FOREIGN KEY (TrainID) REFERENCES Train(TrainID), 
    FOREIGN KEY(CoachID) REFERENCES Coach(CoachID), 
    FOREIGN KEY(PassengerID) REFERENCES Passenger(PassengerID),
    foreign key(Source) References Station(StationID), 
    foreign key(TransactionID) references Transactions(TransactionID), 
    foreign key(Destination) references Station(StationID)
);



-- For now assuming no transaction fails and not storing transaction data

/*CREATE TABLE Payment (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,  
    BookingID INT NOT NULL,                   
    PaymentDate DATETIME NOT NULL,            -- I think not required
    PaymentAmount DECIMAL(10, 2) NOT NULL,          
    PaymentMethod ENUM('Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet') NOT NULL,  
    PaymentStatus ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
);*/

CREATE TABLE WaitingList (
    WaitingID INT NOT NULL, 
    PassengerID INT NOT NULL,                  -- Foreign key to Passenger (assume Passenger table exists)
    TrainID INT NOT NULL,                      -- Foreign key to Train
    CoachID INT NOT NULL,
    TicketID INT NOT NULL,
    TravelDate date,
    PRIMARY KEY(WaitingID,TrainID,CoachID),
    FOREIGN KEY (PassengerID) REFERENCES Passenger(PassengerID),
    FOREIGN KEY (TrainID) REFERENCES Train(TrainID),
    FOREIGN KEY (CoachID) REFERENCES Coach(CoachID),
	FOREIGN KEY (TicketID) REFERENCES Booking(TicketID)
);





INSERT INTO Coach (CoachName) VALUES 
('AC 1-Tier'), 
('AC 2-Tier'),
('Sleeper'), 
('General');


INSERT INTO Station (StationName, City, State) VALUES
('New Delhi Station', 'New Delhi', 'Delhi'),
('Anand Vihar Terminal', 'New Delhi', 'Delhi'),
('Hazrat Nizamuddin', 'New Delhi', 'Delhi'),
('Mumbai Central', 'Mumbai', 'Maharashtra'),
('Chhatrapati Shivaji Maharaj Terminus', 'Mumbai', 'Maharashtra'),
('Lokmanya Tilak Terminus', 'Mumbai', 'Maharashtra'),-- Login ID 6
('Bandra Terminus', 'Mumbai', 'Maharashtra'),
('Howrah Station', 'Kolkata', 'West Bengal'),
('Sealdah', 'Kolkata', 'West Bengal'),
('Shalimar', 'Kolkata', 'West Bengal'),
('Santragachi', 'Kolkata', 'West Bengal'),
('Chennai Central', 'Chennai', 'Tamil Nadu'),
('Chennai Egmore', 'Chennai', 'Tamil Nadu'),
('Tambaram', 'Chennai', 'Tamil Nadu'), -- Login id 14
('Coimbatore Junction', 'Coimbatore', 'Tamil Nadu'), 
('Madurai Junction', 'Madurai', 'Tamil Nadu'),
('Secunderabad', 'Hyderabad', 'Telangana'),
('Hyderabad Deccan', 'Hyderabad', 'Telangana'),
('Kacheguda', 'Hyderabad', 'Telangana'),
('Bangalore City', 'Bengaluru', 'Karnataka'),
('Yesvantpur Junction', 'Bengaluru', 'Karnataka'),
('Mysuru Junction', 'Mysuru', 'Karnataka'),
('Guwahati', 'Guwahati', 'Assam'),
('Dibrugarh', 'Dibrugarh', 'Assam'),
('Patna Junction', 'Patna', 'Bihar'),
('Rajendra Nagar Terminal', 'Patna', 'Bihar'),
('Gaya Junction', 'Gaya', 'Bihar'),
('Bhubaneswar', 'Bhubaneswar', 'Odisha'),
('Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
('Vijayawada Junction', 'Vijayawada', 'Andhra Pradesh');



-- Insert data into LoginDetails
INSERT INTO LoginDetails (LoginName, Password, ContactNumber, Email, UserType) VALUES

-- Passengers (More in number)
('amit_kumar', 'amitpass', '9123456789', 'amit.kumar@example.com', 'Passenger'),-- login id 1
('sneha_gupta', 'snehapass', '9112233445', 'sneha.gupta@example.com', 'Passenger'),
('rahul_verma', 'rahulpass', '9001122334', 'rahul.verma@example.com', 'Passenger'),
('priya_sharma', 'priyapass', '9988776655', 'priya.sharma@example.com', 'Passenger'),
('deepak_singh', 'deepakpass', '9113344556', 'deepak.singh@example.com', 'Passenger'),
('ananya_patil', 'ananyapass', '9124455667', 'ananya.patil@example.com', 'Passenger'),
('vivek_yadav', 'vivekpass', '9135566778', 'vivek.yadav@example.com', 'Passenger'),
('sanjay_mehta', 'sanjaypass', '9146677889', 'sanjay.mehta@example.com', 'Passenger'),
('ruchi_rana', 'ruchipass', '9157788990', 'ruchi.rana@example.com', 'Passenger'),
('varun_bhatt', 'varunpass', '9168899001', 'varun.bhatt@example.com', 'Passenger'), -- login id 10
('isha_malhotra', 'ishapass', '9179900112', 'isha.malhotra@example.com', 'Passenger'),
('arjun_nair', 'arjunpass', '9180011223', 'arjun.nair@example.com', 'Passenger'),
('neha_srivastava', 'nehapass', '9191122334', 'neha.srivastava@example.com', 'Passenger'),
('manish_rao', 'manishpass', '9202233445', 'manish.rao@example.com', 'Passenger'),
('rekha_pillai', 'rekhapass', '9213344556', 'rekha.pillai@example.com', 'Passenger'), -- login id 15
('tarun_kapoor', 'tarunpass', '9224455667', 'tarun.kapoor@example.com', 'Passenger'),
('meera_das', 'meerapass', '9235566778', 'meera.das@example.com', 'Passenger'),
('alok_mishra', 'alokpass', '9246677889', 'alok.mishra@example.com', 'Passenger'),
('naina_saxena', 'nainapass', '9257788990', 'naina.saxena@example.com', 'Passenger'),
('rohit_chaudhary', 'rohitpass', '9268899001', 'rohit.chaudhary@example.com', 'Passenger'),
('kanika_jain', 'kanikapass', '9279900112', 'kanika.jain@example.com', 'Passenger'),
('dev_singhania', 'devpass', '9280011223', 'dev.singhania@example.com', 'Passenger'),
('shruti_menon', 'shrutipass', '9291122334', 'shruti.menon@example.com', 'Passenger'), -- login id 23
-- Admins (Few in number)
('admin', 'admin123', '9876543210', 'admin@example.com', 'Admin'),
('ravi_admin', 'raviadmin', '9000000001', 'ravi.admin@example.com', 'Admin'),
('mohit_admin', 'mohitpass', '9000000002', 'mohit.admin@example.com', 'Admin'), -- login id 18
('aditya_k', 'adipass', '9223344556', 'aditya.k@example.com', 'Passenger'),
('megha_s', 'meghapass', '9334455667', 'megha.s@example.com', 'Passenger'),
('nilesh_m', 'nileshpass', '9445566778', 'nilesh.m@example.com', 'Passenger'),
('kavita_j', 'kavitapass', '9556677889', 'kavita.j@example.com', 'Passenger'),
('siddharth_r', 'sidpass', '9667788990', 'siddharth.r@example.com', 'Passenger'),-- login id 23
('shruti_singh', 'shruti123', '9778899001', 'shruti.singh@example.com', 'Passenger'),
('rohit_tiwari', 'rohit123', '9889900112', 'rohit.tiwari@example.com', 'Passenger') -- login id 25
; 




-- Insert data into Train

INSERT INTO Train (TrainID, TrainName, TotalSeats, Source_Station, Destination_Station, DepartureTime, ArrivalTime) VALUES
(101, 'Rajdhani Express', 200, 2, 5, '10:00:00', '20:00:00'),
(102, 'Shatabdi Express', 150, 3, 7, '08:00:00', '18:00:00'),
(103, 'Duronto Express', 180, 5, 12, '06:30:00', '16:45:00'),
(104, 'Garib Rath', 250, 8, 15, '09:15:00', '19:30:00'),
(105, 'Tejas Express', 220, 4, 10, '07:00:00', '17:15:00'),
(106, 'Vande Bharat', 160, 6, 14, '11:45:00', '21:55:00'),
(107, 'Jan Shatabdi', 140, 10, 3, '05:30:00', '14:50:00'),
(108, 'Humsafar Express', 230, 11, 20, '08:20:00', '18:45:00'),
(109, 'Sampark Kranti', 200, 13, 25, '07:50:00', '18:10:00'),
(110, 'Intercity Express', 180, 9, 21, '09:00:00', '19:25:00'),
(111, 'Bhopal Express', 190, 1, 30, '10:10:00', '21:00:00'),
(112, 'Karnataka Express', 200, 7, 19, '06:15:00', '16:30:00'),
(113, 'Goa Express', 180, 17, 8, '12:30:00', '22:45:00'),
(114, 'Mumbai Mail', 160, 15, 6, '04:00:00', '13:40:00'),
(115, 'Kolkata Superfast', 210, 14, 23, '09:25:00', '19:35:00'),
(116, 'Chennai Express',200,12,24,'06:00:00','17:30:00'),
(117, 'Slow Express',200,1,7,'16:00:00','22:30:00');



INSERT INTO TrainAvailability (TrainID, TravelDate, CoachID, Price, AvailableSeats) VALUES -- TravelDate is the start date
-- Train 101 (Runs on 3 days with coach 1, 2, 3, 4)
(101, '2025-04-02', 1, 3000, 12),
(101, '2025-04-10', 1, 3000, 9),
(101, '2025-04-18', 1, 3000, 14),
(101, '2025-04-02', 2, 1200, 10),
(101, '2025-04-10', 2, 1200, 8),
(101, '2025-04-18', 2, 1200, 14),
(101, '2025-04-02', 3, 800, 10),
(101, '2025-04-10', 3, 800, 8),
(101, '2025-04-18', 3, 800, 11),
(101, '2025-04-02', 4, 400, 7),
(101, '2025-04-10', 4, 400, 6),
(101, '2025-04-18', 4, 400, 9),

-- Train 102 (Runs on 3 days with coach 1, 2, 3, 4)
(102, '2025-04-01', 1, 2000, 13),
(102, '2025-04-08', 1, 2000, 11),
(102, '2025-04-15', 1, 2000, 10),
(102, '2025-04-01', 2, 1000, 14),
(102, '2025-04-08', 2, 1000, 12),
(102, '2025-04-15', 2, 1000, 9),
(102, '2025-04-01', 3, 800, 10),
(102, '2025-04-08', 3, 800, 8),
(102, '2025-04-15', 3, 800, 11),
(102, '2025-04-01', 4, 500, 3),
(102, '2025-04-08', 4, 500, 5),
(102, '2025-04-15', 4, 500, 6),

-- Train 103 (Runs on 3 days, with coaches 1, 2, 3, 4)
(103, '2025-04-03', 1, 3000, 15),
(103, '2025-04-12', 1, 3000, 13),
(103, '2025-04-20', 1, 3000, 11),
(103, '2025-04-03', 2, 2000, 10),
(103, '2025-04-12', 2, 2000, 9),
(103, '2025-04-20', 2, 2000, 12),
(103, '2025-04-03', 3, 800, 7),
(103, '2025-04-12', 3, 800, 5),
(103, '2025-04-20', 3, 800, 9),
(103, '2025-04-03', 4, 400, 6),
(103, '2025-04-12', 4, 400, 5),
(103, '2025-04-20', 4, 400, 8),

-- Train 104 (Runs on 5 days, with coaches 3, 4)
(104, '2025-04-04', 3, 1200, 11),
(104, '2025-04-09', 3, 1200, 11),
(104, '2025-04-04', 4, 1000, 12),
(104, '2025-04-09', 4, 1000, 14),



-- Train 105 (Runs on 4 days, with coaches 1, 2)
(105, '2025-04-05', 1, 3000, 9),
(105, '2025-04-11', 1, 3000, 7),
(105, '2025-04-17', 1, 3000, 14),
(105, '2025-04-23', 1, 3000, 11),
(105, '2025-04-05', 2, 2000, 10),
(105, '2025-04-11', 2, 2000, 8),
(105, '2025-04-17', 2, 2000, 7),
(105, '2025-04-23', 2, 2000, 6),


-- Train 106 (Runs on 3 days, with coaches 2, 3, 4)
(106, '2025-04-06', 2, 2000, 13),
(106, '2025-04-15', 2, 2000, 12),
(106, '2025-04-24', 2, 2000, 11),
(106, '2025-04-06', 3, 800, 10),
(106, '2025-04-15', 3, 800, 9),
(106, '2025-04-24', 3, 800, 8),
(106, '2025-04-06', 4, 400, 7),
(106, '2025-04-15', 4, 400, 6),
(106, '2025-04-24', 4, 400, 5),

-- Train 107 (Runs on 4 days, with coaches 1, 4)
(107, '2025-04-07', 1, 3000, 12),
(107, '2025-04-14', 1, 3000, 10),
(107, '2025-04-21', 1, 3000, 9),
(107, '2025-04-28', 1, 3000, 8),
(107, '2025-04-07', 4, 400, 7),
(107, '2025-04-14', 4, 400, 6),
(107, '2025-04-21', 4, 400, 5),
(107, '2025-04-28', 4, 400, 9),

-- Train 108 (Runs on 3 days, with coaches 2, 3)
(108, '2025-04-02', 2, 2000, 11),
(108, '2025-04-11', 2, 2000, 9),
(108, '2025-04-20', 2, 2000, 7),
(108, '2025-04-02', 3, 800, 6),
(108, '2025-04-11', 3, 800, 8),
(108, '2025-04-20', 3, 800, 9),

-- Train 109 (Runs on 3 days, with coaches 1, 2, 3)

(109, '2025-04-03', 1, 3000, 10),
(109, '2025-04-12', 1, 3000, 8),
(109, '2025-04-20', 1, 3000, 12),
(109, '2025-04-03', 2, 2000, 9),
(109, '2025-04-12', 2, 2000, 7),
(109, '2025-04-20', 2, 2000, 13),
(109, '2025-04-03', 3, 800, 6),
(109, '2025-04-12', 3, 800, 9),
(109, '2025-04-20', 3, 800, 8),

-- Train 110 (Runs on 4 days, with coaches 2, 4)
(110, '2025-04-05', 2, 2000, 12),
(110, '2025-04-10', 2, 2000, 14),
(110, '2025-04-15', 2, 2000, 9),
(110, '2025-04-25', 2, 2000, 7),
(110, '2025-04-05', 4, 400, 10),
(110, '2025-04-10', 4, 400, 8),
(110, '2025-04-15', 4, 400, 6),
(110, '2025-04-25', 4, 400, 5),

-- Train 111 (Runs on 3 days, with coaches 1, 3)
(111, '2025-04-06', 1, 3000, 14),
(111, '2025-04-16', 1, 3000, 12),
(111, '2025-04-26', 1, 3000, 10),
(111, '2025-04-06', 3, 800, 9),
(111, '2025-04-16', 3, 800, 7),
(111, '2025-04-26', 3, 800, 6),

-- Train 112 (Runs on 5 days, with coaches 2, 3, 4)
(112, '2025-04-07', 2, 2000, 12),
(112, '2025-04-13', 2, 2000, 10),
(112, '2025-04-18', 2, 2000, 8),
(112, '2025-04-22', 2, 2000, 7),
(112, '2025-04-29', 2, 2000, 6),
(112, '2025-04-07', 3, 800, 10),
(112, '2025-04-13', 3, 800, 9),
(112, '2025-04-18', 3, 800, 7),
(112, '2025-04-22', 3, 800, 6),
(112, '2025-04-29', 3, 800, 5),
(112, '2025-04-07', 4, 400, 9),
(112, '2025-04-13', 4, 400, 8),
(112, '2025-04-18', 4, 400, 6),
(112, '2025-04-22', 4, 400, 5),
(112, '2025-04-29', 4, 400, 4),

-- Train 113 (Runs on 3 days, with coaches 1, 2, 3, 4)
(113, '2025-04-08', 1, 3000, 15),
(113, '2025-04-17', 1, 3000, 13),
(113, '2025-04-26', 1, 3000, 11),
(113, '2025-04-08', 2, 2000, 9),
(113, '2025-04-17', 2, 2000, 7),
(113, '2025-04-26', 2, 2000, 5),
(113, '2025-04-08', 3, 800, 12),
(113, '2025-04-17', 3, 800, 10),
(113, '2025-04-26', 3, 800, 8),
(113, '2025-04-08', 4, 400, 6),
(113, '2025-04-17', 4, 400, 5),
(113, '2025-04-26', 4, 400, 4),

-- Train 114 (Runs on 4 days, with coaches 1, 3)
(114, '2025-04-09', 1, 3000, 10),
(114, '2025-04-12', 1, 3000, 9),
(114, '2025-04-20', 1, 3000, 8),
(114, '2025-04-28', 1, 3000, 7),
(114, '2025-04-09', 3, 800, 7),
(114, '2025-04-12', 3, 800, 6),
(114, '2025-04-20', 3, 800, 5),
(114, '2025-04-28', 3, 800, 4),

-- Train 115 (Runs on 3 days, with coaches 2, 3, 4)
(115, '2025-04-10', 2, 2000, 14),
(115, '2025-04-15', 2, 2000, 12),
(115, '2025-04-25', 2, 2000, 10),
(115, '2025-04-10', 3, 800, 11),
(115, '2025-04-15', 3, 800, 9),
(115, '2025-04-25', 3, 800, 7),
(115, '2025-04-10', 4, 400, 8),
(115, '2025-04-15', 4, 400, 6),
(115, '2025-04-25', 4, 400, 5),

-- Train 116(Runs on 3 days with coachs 1, 3, 4)
(116, '2025-04-09', 1, 1200, 0),
(116, '2025-04-15', 1, 1200, 12),
(116, '2025-04-25', 1, 1200, 10),
(116, '2025-04-09', 3, 800, 11),
(116, '2025-04-15', 3, 800, 9),
(116, '2025-04-25', 3, 800, 7),
(116, '2025-04-09', 4, 400, 8),
(116, '2025-04-15', 4, 400, 6),
(116, '2025-04-25', 4, 400, 5),

-- Train 117(Runs on 2 days with coaches 2, 3)
(117, '2025-04-10', 2, 1000, 0),
(117, '2025-04-15', 2, 1000, 12),
(117, '2025-04-10', 3, 800, 11),
(117, '2025-04-15', 3, 800, 9);


-- Insert data into Route (Ensure SequenceNumber is an integer)
INSERT INTO Route (TrainID, StationID, SequenceNumber, ArrivalTime) VALUES
-- Rajdhani Express (Train 101)
(101, 2, 1, '10:00:00'),
(101, 10, 2, '15:30:00'),
(101, 5, 3, '20:00:00'),

-- Shatabdi Express (Train 102)
(102, 3, 1, '08:00:00'),
(102, 6, 2, '12:00:00'),
(102, 14, 3, '15:30:00'),
(102, 7, 4, '18:00:00'),

-- Duronto Express (Train 103)
(103, 5, 1, '06:30:00'),
(103, 9, 2, '10:45:00'),
(103, 17, 3, '14:00:00'),
(103, 12, 4, '16:45:00'),

-- Garib Rath (Train 104)
(104, 8, 1, '09:15:00'),
(104, 21, 2, '14:30:00'),
(104, 15, 3, '19:30:00'),

-- Tejas Express (Train 105)
(105, 4, 1, '07:00:00'),
(105, 11, 2, '11:30:00'),
(105, 20, 3, '15:30:00'),
(105, 10, 4, '17:15:00'),

-- Vande Bharat (Train 106)
(106, 6, 1, '11:45:00'),
(106, 16, 2, '15:00:00'),
(106, 22, 3, '18:30:00'),
(106, 14, 4, '21:55:00'),

-- Jan Shatabdi (Train 107)
(107, 10, 1, '05:30:00'),
(107, 3, 2, '14:50:00'),

-- Humsafar Express (Train 108)
(108, 11, 1, '08:20:00'),
(108, 18, 2, '12:30:00'),
(108, 24, 3, '16:00:00'),
(108, 20, 4, '18:45:00'),

-- Sampark Kranti (Train 109)
(109, 13, 1, '07:50:00'),
(109, 22, 2, '12:45:00'),
(109, 27, 3, '16:30:00'),
(109, 25, 4, '18:10:00'),

-- Intercity Express (Train 110)
(110, 9, 1, '09:00:00'),
(110, 15, 2, '12:15:00'),
(110, 19, 3, '16:45:00'),
(110, 21, 4, '19:25:00'),

-- Bhopal Express (Train 111)
(111, 1, 1, '10:10:00'),
(111, 5, 2, '13:30:00'),
(111, 10, 3, '16:00:00'),
(111, 28, 4, '19:00:00'),
(111, 30, 5, '21:00:00'),

-- Karnataka Express (Train 112)
(112, 7, 1, '06:15:00'),
(112, 15, 2, '12:00:00'),
(112, 19, 3, '16:30:00'),

-- Goa Express (Train 113)
(113, 17, 1, '12:30:00'),
(113, 25, 2, '17:00:00'),
(113, 8, 3, '22:45:00'),

-- Mumbai Mail (Train 114)
(114, 15, 1, '04:00:00'),
(114, 5, 2, '08:30:00'),
(114, 6, 3, '13:40:00'),

-- Kolkata Superfast (Train 115)
(115, 14, 1, '09:25:00'),
(115, 18, 2, '13:00:00'),
(115, 23, 3, '19:35:00'), 

-- Chennai Express (Train 116)
(116, 12, 1, '06:00:00'), 
(116, 16, 2, '12:00:00'), 
(116, 24, 3, '17:30:00'),

-- Slow Express (Train 117)
(117, 1, 1, '16:00:00'), 
(117, 7, 2, '22:30:00')
;



INSERT INTO Passenger (PassengerID, LoginID, FirstName, LastName, AadharNO, Gender, Age, DOB) VALUES
(1, 1, 'Amit', 'Sharma', '123456789012', 'M', 35, '1989-05-14'),
(2, 3, 'Sneha', 'Verma', '123456789013', 'F', 29, '1995-02-20'),
(3, 5, 'Ravi', 'Kumar', '123456789014', 'M', 42, '1982-03-12'),
(4, 5, 'Pooja', 'Rana', '123456789015', 'F', 38, '1986-08-07'),
(5, 9, 'Deepak', 'Mehta', '123456789016', 'M', 47, '1978-12-30'),
(6, 9, 'Rekha', 'Joshi', '123456789017', 'F', 44, '1980-01-10'),
(7, 10, 'Varun', 'Pillai', '123456789018', 'M', 22, '2002-11-09'),
(8, 10, 'Neha', 'Gupta', '123456789019', 'F', 25, '1999-04-05'),
(9, 12, 'Arjun', 'Yadav', '123456789020', 'M', 30, '1993-07-23'),
(10, 12, 'Isha', 'Singh', '123456789021', 'F', 27, '1997-06-01'),
(11, 15, 'Manish', 'Patil', '123456789022', 'M', 40, '1984-02-18'),
(12, 15, 'Ruchi', 'Naik', '123456789023', 'F', 33, '1991-10-03'),
(13, 1, 'Simran', 'Chawla', '123456789024', 'F', 20, '2004-09-19'),
(14, 1, 'Karan', 'Kapoor', '123456789025', 'M', 24, '2000-01-11'),
(15, 3, 'Nikita', 'Saxena', '123456789026', 'F', 26, '1998-03-25'),
(16, 5, 'Ankit', 'Tripathi', '123456789027', 'M', 37, '1987-11-06'),
(17, 5, 'Payal', 'Mishra', '123456789028', 'F', 31, '1993-05-28'),
(18, 5, 'Rajeev', 'Malik', '123456789029', 'M', 36, '1988-12-14'),
(19, 7, 'Tanya', 'Deshmukh', '123456789030', 'F', 21, '2003-06-07'),
(20, 7, 'Alok', 'Srinivasan', '123456789031', 'M', 28, '1996-07-15'),
(21, 9, 'Meera', 'Kale', '123456789032', 'F', 39, '1985-03-02'),
(22, 10, 'Vikram', 'Joshi', '123456789033', 'M', 32, '1992-09-26'),
(23, 10, 'Divya', 'Reddy', '123456789034', 'F', 34, '1990-08-17'),
(24, 12, 'Rahul', 'Saxena', '123456789035', 'M', 27, '1997-01-29'),
(25, 12, 'Anjali', 'Agarwal', '123456789036', 'F', 22, '2002-10-13'),
(26, 14, 'Priya', 'Bhatt', '123456789037', 'F', 26, '1998-12-05'),
(27, 14, 'Arvind', 'Kumar', '123456789038', 'M', 41, '1983-04-22'),
(28, 14, 'Sonal', 'Jain', '123456789039', 'F', 36, '1988-07-30'),
(29, 15, 'Gaurav', 'Shetty', '123456789040', 'M', 33, '1991-11-02'),
(30, 15, 'Swati', 'Menon', '123456789041', 'F', 30, '1994-03-19'), 
(31, 19, 'Aditya', 'Kapoor', '123456789042', 'M', 28, '1996-05-10'),
(32, 20, 'Megha', 'Sen', '123456789043', 'F', 26, '1998-09-12'),
(33, 21, 'Nilesh', 'Mehra', '123456789044', 'M', 32, '1992-03-18'),
(34, 22, 'Kavita', 'Jain', '123456789045', 'F', 30, '1994-11-03'),
(35, 23, 'Siddharth', 'Rao', '123456789046', 'M', 27, '1997-08-27'), 
(36, 21, 'Riya', 'Sharma', '123456789047', 'F', 24, '2000-04-05'),
(37, 22, 'Aman', 'Verma', '123456789048', 'M', 29, '1995-07-12'),
(38, 23, 'Neelam', 'Rao', '123456789049', 'F', 34, '1990-01-20'),
(39, 24, 'Kunal', 'Jain', '123456789050', 'M', 27, '1997-06-18'),
(40, 25, 'Sneha', 'Mehta', '123456789051', 'F', 31, '1993-09-09'),
(41, 21, 'Tushar', 'Malik', '123456789052', 'M', 30, '1994-03-15'),
(42, 22, 'Ananya', 'Kapoor', '123456789053', 'F', 26, '1998-11-11'),
(43, 23, 'Rakesh', 'Sen', '123456789054', 'M', 28, '1996-02-02'),
(44, 24, 'Divya', 'Patel', '123456789055', 'F', 25, '1999-08-24'),
(45, 25, 'Harsh', 'Yadav', '123456789056', 'M', 33, '1991-05-30');

-- I am assuming transactions dont fail
INSERT INTO Transactions (LoginID, Amount, PaymentMean) VALUES
(1, 2000, 'Credit Card'),-- Transaction ID 1
(3, 800, 'UPI'),
(5, 1200, 'Debit Card'),
(5, 2000, 'Net Banking'),
(9, 1600, 'Wallet'),
(10, 6000, 'UPI'), 
(12, 6000, 'Credit Card'), 
(15, 3000, 'Net Banking'),
(15, 3000, 'Wallet'), 
(1, 1000, 'Debit Card'), 
(3, 1200, 'UPI'), 
(5, 6000, 'Credit Card'), 
(7, 6000, 'Net Banking'), 
(9, 1000, 'Debit Card'), 
(10, 2000, 'Wallet'), 
(12, 1600, 'UPI'), 
(14, 6000, 'Credit Card'), 
(15, 800, 'Debit Card'),
(19, 2400, 'Credit Card'),
(20, 2000, 'Wallet'),
(21, 2400, 'Credit Card'),
(22, 2000, 'Wallet'); -- Transaction ID 22


INSERT INTO Booking (PassengerID, TransactionID, TrainID, BookingDate, CoachID, BookingStatus, RefundStatus, Source, Destination, TravelDate, LoginID) VALUES
-- LoginID 1 booked 1 passenger
(1, 1, 105, '2025-03-12 10:00:00', 2, 'CONFIRMED', 'Not requested', 4, 20, '2025-04-17', 1),

-- LoginID 3 booked 1 passenger
(2, 2, 106, '2025-03-14 15:30:00', 3, 'CONFIRMED', 'Not requested', 6, 22, '2025-04-06', 3),

-- LoginID 5 booked 2 passengers
(3, 3, 101, '2025-03-15 10:00:00', 2, 'CONFIRMED', 'Not requested', 2, 5, '2025-04-18', 5),
(4, 4, 102, '2025-03-16 12:30:00', 1, 'CONFIRMED', 'Not requested', 3, 14, '2025-04-08', 5),

-- LoginID 9 booked 2 passengers
(5, 5, 101, '2025-03-18 14:15:00', 3, 'CONFIRMED', 'Not requested', 2, 5, '2025-04-18', 9),
(6, 5, 101, '2025-03-18 14:15:00', 3, 'CONFIRMED', 'Not requested', 10, 5, '2025-04-18', 9),

-- LoginID 10 booked 2 passengers
(7, 6, 111, '2025-03-12 15:45:00', 3, 'CONFIRMED', 'Not requested', 5, 28, '2025-04-15', 10),
(8, 6, 111, '2025-03-12 15:45:00', 3, 'CONFIRMED', 'Not requested', 5, 28, '2025-04-15', 10),

-- LoginID 12 booked 2 passengers
(9, 7, 103, '2025-03-16 13:40:00', 1, 'CONFIRMED', 'Not requested', 5, 17, '2025-04-03', 12),
(10, 7, 103, '2025-03-16 13:40:00', 1, 'CONFIRMED', 'Not requested', 5, 17, '2025-04-03', 12),

-- LoginID 15 booked 2 passengers
(11, 8, 113, '2025-03-08 10:20:00', 1, 'CONFIRMED', 'Not requested', 1, 3, '2025-04-17', 15),
(12, 9, 101, '2025-03-20 09:40:00', 1, 'CONFIRMED', 'Not requested', 2, 3, '2025-04-18', 15),

-- LoginID 1 books 2 more passengers
(13, 10, 102, '2025-03-21 08:30:00', 4, 'CONFIRMED', 'Not requested', 3, 4, '2025-04-15', 1),
(14, 10, 102, '2025-03-21 08:30:00', 4, 'CONFIRMED', 'Not requested', 3, 4, '2025-04-15', 1),

-- LoginID 3 books 1 more
(15, 11, 101, '2025-03-21 09:10:00', 2, 'CONFIRMED', 'Not requested', 2, 5, '2025-04-18', 3),

-- LoginID 5 books 3 more passengers
(16, 12, 103, '2025-03-22 10:00:00', 2, 'CONFIRMED', 'Not requested', 9, 17, '2025-04-20', 5),
(17, 12, 103, '2025-03-22 10:00:00', 2, 'CONFIRMED', 'Not requested', 9, 17, '2025-04-20', 5),
(18, 12, 103, '2025-03-22 10:00:00', 2, 'CONFIRMED', 'Not requested', 9, 17, '2025-04-20', 5),

-- LoginID 7 makes 2 bookings
(19, 13, 107, '2025-03-23 11:15:00', 1, 'CONFIRMED', 'Not requested', 10, 3, '2025-04-28', 7),
(20, 13, 107, '2025-03-23 11:15:00', 1, 'CONFIRMED', 'Not requested', 10, 3, '2025-04-28', 7),

-- LoginID 9 books 1 more
(21, 14, 102, '2025-03-24 14:45:00', 2, 'CONFIRMED', 'Not requested', 6, 7, '2025-04-15', 9),

-- LoginID 10 books 2 more
(22, 15, 102, '2025-03-25 09:30:00', 2, 'CONFIRMED', 'Not requested', 3, 14, '2025-04-15', 10),
(23, 15, 102, '2025-03-25 09:30:00', 2, 'CONFIRMED', 'Not requested', 3, 14, '2025-04-15', 10),

-- LoginID 12 books 2 more
(24, 16, 103, '2025-03-26 12:00:00', 3, 'CONFIRMED', 'Not requested', 5, 17, '2025-04-20', 12),
(25, 16, 103, '2025-03-26 12:00:00', 3, 'CONFIRMED', 'Not requested', 5, 17, '2025-04-20', 12),

-- LoginID 14 books 3 passengers
(26, 17, 110, '2025-03-27 13:30:00',2, 'CONFIRMED', 'Not requested', 9, 19, '2025-04-10', 14),
(27, 17, 110, '2025-03-27 13:30:00', 2, 'CONFIRMED', 'Not requested', 9, 19, '2025-04-10', 14),
(28, 17, 110, '2025-03-27 13:30:00', 2, 'CONFIRMED', 'Not requested', 9, 19, '2025-04-10', 14),

-- LoginID 15 books 2 more
(29, 18, 115, '2025-03-28 14:45:00', 4, 'CONFIRMED', 'Not requested', 14, 23, '2025-04-25', 15),
(30, 18, 115, '2025-03-28 14:45:00', 4, 'CONFIRMED', 'Not requested', 14, 23, '2025-04-25', 15),

-- LoginID 19 booked 2 tickets
(31, 19, 116, '2025-04-09 10:00:00', 1, 'CONFIRMED', 'Not requested', 12, 24, '2025-04-09', 19),
(32, 19, 116, '2025-04-09 10:00:00', 1, 'CONFIRMED', 'Not requested', 12, 24, '2025-04-09', 19),

-- LoginID 20 booked 2 tickets
(33, 20, 117, '2025-03-23 11:00:00', 2, 'CONFIRMED', 'Not requested', 1, 7, '2025-04-10', 20),
(34, 20, 117, '2025-03-23 11:00:00', 2, 'CONFIRMED', 'Not requested', 1, 7, '2025-04-10', 20),

-- Loginid 21 booked 2 tickets
(35, 21, 116, '2025-04-09 11:00:00', 1, 'WAITING', 'Not requested', 12, 24, '2025-04-09', 21),
(36, 21, 116, '2025-04-09 11:00:00', 1, 'WAITING', 'Not requested', 12, 24, '2025-04-09', 21),

-- LoginID 22 booked 2 tickets
(37, 22, 117, '2025-03-23 12:00:00', 2, 'WAITING', 'Not requested', 1, 7, '2025-04-10', 22),
(38, 22, 117, '2025-03-23 12:00:00', 2, 'WAITING', 'Not requested', 1, 7, '2025-04-10', 22)


;

INSERT INTO WaitingList (WaitingID, PassengerID, TrainID, CoachID, TicketID, TravelDate) VALUES
(1, 35, 116, 1, 35, '2025-04-09'),
(2, 36, 116, 1, 36, '2025-04-09'),
(1, 37, 117, 2, 37, '2025-04-10'),
(2, 38, 117, 2, 38, '2025-04-10');


-- Searching for trains arriving on a station in between a particular time frame
select t1.trainid, t1.trainname, t2.traveldate, t2.coachid,t2.price,t2.availableseats,t2.arrivaltime
from train t1 inner join (Select trainavailability.trainid,trainavailability.traveldate,
trainavailability.coachid,trainavailability.price,trainavailability.availableseats,route.arrivaltime
from trainavailability inner join route on trainavailability.trainID = route.trainID
where route.arrivaltime between '5:00:00' and '10:00:00' and trainavailability.TravelDate = '2025-04-02'
and route.stationID =(select stationID from station where stationname = 'Anand Vihar Terminal')) t2 on t1.trainid = t2.trainid;

-- Transactions Done on Dates
Select l1.loginid,l1.loginname,l1.contactnumber,l1.email,l2.amount,l2.bookingdate
from logindetails l1 inner join ( Select Transactions.LoginID, Transactions.Amount, Booking.BookingDate
from Transactions inner join Booking on Transactions.TransactionID = Booking.TransactionID
Group By Transactions.LoginID, Transactions.Amount, Booking.BookingDate
Order By Booking.BookingDate) l2 on l1.loginid = l2.loginid;

-- Date of each train where max bookings occurred
select t1.trainid,t1.trainname, t2.traveldate,t2.maxbookings
from train t1 inner join(Select b.TrainID, b.TravelDate, Count(*) as MaxBookings
from Booking b
Group By b.TrainID, b.TravelDate
Having Count(*) = (Select Max(b2.count) from (Select b1.TrainID, b1.TravelDate, count(*) as count from Booking b1
where b1.trainID = b.TrainID Group By b1.TrainID, b1.TravelDate) as b2)
order by trainID) t2 on t1.trainid= t2.trainid;

-- Passenger details of people travelling from a given station to a given station (in this case Lokmanya Tilak Terminus to Tambaram)
select distinct p.passengerid,p.loginid,p.firstname,p.lastname,p.aadharno,p.gender,p.age,p.dob,a1.trainid,a1.traveldate
from passenger p inner join (select b.passengerID, b.trainID, b.traveldate
from booking b inner join (select * from ((select distinct r1.TrainID, r1.arrivalTime, r2.arrivalTime as reachingTime from Route r1 
join Route r2 on r1.TrainID=
r2.TrainID where (r1.StationID=(select StationID from Station where StationName='Lokmanya Tilak Terminus') and r2.StationID= 
(select StationID from Station where StationName='Tambaram')and r1.SequenceNumber<r2.SequenceNumber)) r3 natural join TrainAvailability))
a on b.trainID = a.trainID and b.traveldate = a.traveldate) a1 on p.passengerid = a1.passengerid;

-- Sorting people based on number of bookings made in decreasing order
Select loginid, count(*)
from booking
group by loginid
order by count(*) desc;


-- Following query will tell all the trains that move between particular stations with their travel date, time and availability status
-- ordered by travel date
SELECT * 
FROM (
    SELECT DISTINCT 
        r1.TrainID, 
        r1.arrivalTime, 
        r2.arrivalTime AS reachingTime 
    FROM Route r1 
    JOIN Route r2 ON r1.TrainID = r2.TrainID
    WHERE 
        r1.StationID = (SELECT StationID FROM Station WHERE StationName = 'Lokmanya Tilak Terminus') 
        AND r2.StationID = (SELECT StationID FROM Station WHERE StationName = 'Tambaram') 
        AND r1.SequenceNumber < r2.SequenceNumber
) AS r3 
NATURAL JOIN TrainAvailability 
ORDER BY TravelDate;

-- This query retrieves all trains that travel between 'Lokmanya Tilak Terminus' and 'Tambaram'
-- on a specific date ('2025-04-15') along with their arrival time, reaching time, 
-- and availability status.
SELECT * 
FROM (
    SELECT DISTINCT 
        r1.TrainID, 
        r1.arrivalTime, 
        r2.arrivalTime AS reachingTime 
    FROM Route r1 
    JOIN Route r2 ON r1.TrainID = r2.TrainID
    WHERE 
        r1.StationID = (SELECT StationID FROM Station WHERE StationName = 'Lokmanya Tilak Terminus') 
        AND r2.StationID = (SELECT StationID FROM Station WHERE StationName = 'Tambaram') 
        AND r1.SequenceNumber < r2.SequenceNumber
) AS r3 
NATURAL JOIN TrainAvailability 
WHERE TravelDate = '2025-04-15';


-- Following query will tell all the trains that move from delhi to mumbai ordered by travel date
SELECT 
    r3.TrainID, 
    r3.arrivalTime, 
    r3.reachingTime, 
    srcStation.StationName AS sourceStation, 
    destStation.StationName AS destinationStation, 
    ta.TravelDate, ta.CoachID, ta.Price, ta.AvailableSeats
FROM 
    (
        SELECT DISTINCT 
            r1.TrainID, 
            r1.arrivalTime, 
            r2.arrivalTime AS reachingTime, 
            r1.StationID AS sourceStationID, 
            r2.StationID AS destinationStationID  
        FROM Route r1 
        JOIN Route r2 ON r1.TrainID = r2.TrainID 
        WHERE 
            r1.StationID IN (SELECT StationID FROM Station WHERE city = 'New Delhi') 
            AND r2.StationID IN (SELECT StationID FROM Station WHERE city = 'Mumbai') 
            AND r1.SequenceNumber < r2.SequenceNumber
    ) AS r3
NATURAL JOIN TrainAvailability ta
JOIN Station srcStation ON r3.sourceStationID = srcStation.StationID
JOIN Station destStation ON r3.destinationStationID = destStation.StationID
Order By ta.TravelDate;



-- Following query will tell all the trains that move from delhi to mumbai on a particular date
SELECT 
    r3.TrainID, 
    r3.arrivalTime, 
    r3.reachingTime, 
    srcStation.StationName AS sourceStation, 
    destStation.StationName AS destinationStation, 
    ta.TravelDate, 
    ta.CoachID, ta.Price, ta.AvailableSeats
FROM 
    (
        SELECT DISTINCT 
            r1.TrainID, 
            r1.arrivalTime, 
            r2.arrivalTime AS reachingTime, 
            r1.StationID AS sourceStationID, 
            r2.StationID AS destinationStationID  
        FROM Route r1 
        JOIN Route r2 ON r1.TrainID = r2.TrainID 
        WHERE 
            r1.StationID IN (SELECT StationID FROM Station WHERE city = 'New Delhi') 
            AND r2.StationID IN (SELECT StationID FROM Station WHERE city = 'Mumbai') 
            AND r1.SequenceNumber < r2.SequenceNumber
    ) AS r3
NATURAL JOIN TrainAvailability ta
JOIN Station srcStation ON r3.sourceStationID = srcStation.StationID
JOIN Station destStation ON r3.destinationStationID = destStation.StationID
where ta.TravelDate='2025-04-01';

-- Viewing booking history
select B.TicketID, T.TrainName, B.BookingDate, B.BookingStatus 
from Booking B 
join Train T on B.TrainID=T.TrainID 
where B.LoginID=1 
order by B.BookingDate desc;


-- Calculate total revenue generated by each train.
select T.TrainID, T.TrainName, sum(TR.Amount) as Revenue 
from Train T 
join Booking B on T.TrainID=B.TrainID 
join Transactions TR on B.TransactionID=TR.TransactionID 
group by T.TrainID, T.TrainName;

--  Retrieve the arrival times and station names for a given train by joining the Route table with the Station table.
select S.StationName, R.ArrivalTime 
from Route R 
join Station S on R.StationID = S.StationID 
where R.TrainID = 101 
order by R.SequenceNumber;

--  Show all Stations in a specific route
select 
    r.TrainID, r.SequenceNumber, s.StationID, s.StationName, s.City, s.State, r.ArrivalTime
from Route r
join Station s on r.StationID = s.StationID
where r.TrainID = 101 
order by r.SequenceNumber;


--  find all the trains passing through a specific station
select distinct T.TrainID, T.TrainName 
from Route R 
join Train T on R.TrainID = T.TrainID 
where R.StationID = 10;




-- When cancelling happens available tickets increase
-- update TrainAvailability as ta
-- join Booking as b 
--   on ta.TrainID = b.TrainID 
--   and ta.TravelDate = b.TravelDate 
--   and ta.CoachID = b.CoachID
-- set ta.AvailableSeats = ta.AvailableSeats + 1
-- where b.TicketID = 1;





--  Retrieve the payment history for a specific user by joining the Payment and Booking tables and ordering the results by the most recent payment date.
select 
    t.TransactionID as PaymentID,
    b.BookingDate as PaymentDate,
    t.Amount as PaymentAmount,
    t.PaymentMean as PaymentMethod,
    b.TicketID
from Transactions t
join Booking b on t.TransactionID = b.TransactionID
where b.LoginID = 1
order by b.BookingDate desc;




-- Retrieve the total payments made by a specific user in the last six months.
select sum(t.Amount) as total_payments
from Transactions t
join Booking b on t.TransactionID = b.TransactionID
where b.LoginID = 1
  and b.BookingDate >= date_sub(curdate(), interval 6 month);

select * from LoginDetails;

SELECT 
  B.TransactionID, 
  T.TrainName,
  B.BookingDate AS BookingDate, 
  B.BookingStatus 
  FROM Booking B 
  NATURAL JOIN Train T
  WHERE B.LoginID = 1 
  GROUP BY B.TransactionID, T.TrainName, B.BookingStatus, B.BookingDAte
  ORDER BY BookingDate DESC;

select * from Booking;
SELECT 
    B.TicketID,
    P.FirstName,
    P.LastName,
    C.CoachName,
    S1.StationName AS SourceStation,
    S2.StationName AS DestinationStation,
    T.TrainName,
    B.TravelDate,
    B.BookingStatus,
    B.RefundStatus,
    B.BookingDate
FROM Booking B
JOIN Passenger P ON B.PassengerID = P.PassengerID
JOIN Coach C ON B.CoachID = C.CoachID
JOIN Station S1 ON B.Source = S1.StationID
JOIN Station S2 ON B.Destination = S2.StationID
JOIN Train T ON B.TrainID = T.TrainID
WHERE B.TransactionID = 10;
select * from WaitingList;