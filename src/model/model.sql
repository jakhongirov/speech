CREATE TABLE admins (
   id bigserial PRiMARY KEY,
   username text not null,
   password text not null,
   role text DEFAULT 'admin',
   create_at timestamptz DEFAULT CURRENT_TIMESTAMP
);