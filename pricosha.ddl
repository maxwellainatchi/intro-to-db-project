create table Comment
(
	id int not null,
	username varchar(50) not null,
	timest timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	comment_text varchar(250) null,
	primary key (id, username, timest)
)
engine=InnoDB charset=latin1
;

create index username
	on Comment (username)
;

create table Content
(
	id int auto_increment
		primary key,
	username varchar(50) null,
	timest timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	file_path varchar(100) null,
	content_name varchar(50) null,
	public tinyint(1) null
)
engine=InnoDB charset=latin1
;

create index username
	on Content (username)
;

alter table Comment
	add constraint comment_ibfk_1
		foreign key (id) references Content (id)
;

create table FriendGroup
(
	group_name varchar(50) not null,
	username varchar(50) not null,
	description varchar(50) null,
	primary key (group_name, username)
)
engine=InnoDB charset=latin1
;

create index username
	on FriendGroup (username)
;

create table Likes
(
	id int not null,
	username varchar(50) not null,
	date date null,
	primary key (id, username),
	constraint likes_ibfk_1
		foreign key (id) references Content (id)
)
engine=InnoDB charset=latin1
;

create index username
	on Likes (username)
;

create table Member
(
	username varchar(50) not null,
	group_name varchar(50) not null,
	username_creator varchar(50) not null,
	primary key (username, group_name, username_creator),
	constraint member_ibfk_2
		foreign key (group_name, username_creator) references FriendGroup (group_name, username)
)
engine=InnoDB charset=latin1
;

create index group_name
	on Member (group_name, username_creator)
;

create table Person
(
	username varchar(50) not null
		primary key,
	password varchar(128) null,
	first_name varchar(50) null,
	last_name varchar(50) null
)
engine=InnoDB charset=latin1
;

alter table Comment
	add constraint comment_ibfk_2
		foreign key (username) references Person (username)
;

alter table Content
	add constraint content_ibfk_1
		foreign key (username) references Person (username)
;

alter table FriendGroup
	add constraint friendgroup_ibfk_1
		foreign key (username) references Person (username)
;

alter table Likes
	add constraint likes_ibfk_2
		foreign key (username) references Person (username)
;

alter table Member
	add constraint member_ibfk_1
		foreign key (username) references Person (username)
;

create table Share
(
	id int not null,
	group_name varchar(50) not null,
	username varchar(50) not null,
	primary key (id, group_name, username),
	constraint share_ibfk_1
		foreign key (id) references Content (id),
	constraint share_ibfk_2
		foreign key (group_name, username) references FriendGroup (group_name, username)
)
engine=InnoDB charset=latin1
;

create index group_name
	on Share (group_name, username)
;

create table Tag
(
	id int not null,
	username_tagger varchar(50) not null,
	username_taggee varchar(50) not null,
	timest timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
	status tinyint(1) null,
	primary key (id, username_tagger, username_taggee),
	constraint tag_ibfk_1
		foreign key (id) references Content (id),
	constraint tag_ibfk_2
		foreign key (username_tagger) references Person (username),
	constraint tag_ibfk_3
		foreign key (username_taggee) references Person (username)
)
engine=InnoDB charset=latin1
;

create index username_tagger
	on Tag (username_tagger)
;

create index username_taggee
	on Tag (username_taggee)
;

