create table envelopes (
    id serial primary key,
    name varchar(255) not null,
    budget int not null
);

insert into envelopes (name, budget) values ('groceries', 800);

insert into envelopes (name, budget) values ('transportation', 100);