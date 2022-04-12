-- Table: public.Stock Info

-- DROP TABLE IF EXISTS public."Stock Info";

CREATE TABLE IF NOT EXISTS public."Stock_Info"
(
stock_id integer NOT NULL,
stock_market character varying(64) COLLATE pg_catalog."default" NOT NULL,
stock_name character varying(64) COLLATE pg_catalog."default" NOT NULL,
stock_symbol character varying(8) COLLATE pg_catalog."default" NOT NULL,
stock_cap money NOT NULL,
CONSTRAINT "Stock_Info_pkey" PRIMARY KEY (stock_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Stock_Info"
OWNER to postgres;