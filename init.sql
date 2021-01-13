create table envelopes (
    id serial primary key,
    name varchar(255) not null unique,
    budget int not null
);


create table transactions (
    id serial primary key,
    date date default current_date,
    amount decimal not null,
    recipient varchar(255) not null,
    envelope_name varchar(255) references envelopes(name)
);

insert into envelopes (name, budget) values ('groceries', 800);

insert into envelopes (name, budget) values ('transportation', 100);

insert into transactions (amount, recipient, envelope_name) values (100, 'dimitris', 'groceries');