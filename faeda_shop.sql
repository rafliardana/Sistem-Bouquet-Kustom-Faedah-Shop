--
-- PostgreSQL database dump
--

\restrict Q6v8a9oje9jCgKCushZ38IjDtfwOsx5yaX2tfYs5M39YvOvBHaZmt2rHdu5nAuJ

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_created_at;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_methods DROP CONSTRAINT IF EXISTS payment_methods_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.payment_methods;
DROP TABLE IF EXISTS public.orders;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id character varying(100) NOT NULL,
    order_number character varying(20) NOT NULL,
    user_id uuid,
    customer_email character varying(255),
    customer_name character varying(255),
    customer_phone character varying(50),
    customer_address text,
    product jsonb NOT NULL,
    customization jsonb NOT NULL,
    total_price integer NOT NULL,
    status character varying(30) DEFAULT 'menunggu_konfirmasi'::character varying,
    payment_method character varying(50),
    payment_method_label character varying(100),
    payment_proof_path text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['menunggu_konfirmasi'::character varying, 'dalam_proses'::character varying, 'pesanan_siap'::character varying, 'selesai'::character varying])::text[])))
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    detail text DEFAULT ''::text,
    needs_proof boolean DEFAULT false
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    base_price integer DEFAULT 0 NOT NULL,
    image text DEFAULT ''::text,
    category character varying(100) DEFAULT 'Campur'::character varying,
    sizes jsonb DEFAULT '[]'::jsonb,
    addons jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'customer'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'customer'::character varying])::text[])))
);


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, user_id, customer_email, customer_name, customer_phone, customer_address, product, customization, total_price, status, payment_method, payment_method_label, payment_proof_path, created_at) FROM stdin;
1781969401766-4126ea0d	FLR-401767	795bf2ad-a2c3-403d-91df-4d8d88852ad1	rafli@gmail.com	rafli	085278077957	tiban 3	{"id": "p1", "name": "Classic Rose Bouquet", "image": "https://images.unsplash.com/photo-1487530811176-3780de880c2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", "sizes": [{"id": "S", "label": "Kecil", "stems": "5–7 tangkai", "priceMultiplier": 1}, {"id": "M", "label": "Sedang", "stems": "10–15 tangkai", "priceMultiplier": 1.7}, {"id": "L", "label": "Besar", "stems": "20–25 tangkai", "priceMultiplier": 2.4}, {"id": "XL", "label": "Extra Besar", "stems": "30+ tangkai", "priceMultiplier": 3.2}], "addons": [{"id": "vase", "label": "Vas Bunga", "price": 75000}, {"id": "ribbon", "label": "Pita Premium", "price": 25000}, {"id": "card", "label": "Kartu Ucapan", "price": 15000}, {"id": "wrap", "label": "Wrapping Mewah", "price": 40000}], "category": "Mawar", "basePrice": 150000, "description": "Rangkaian mawar klasik yang elegan dan mewah. Cocok untuk berbagai momen spesial seperti ulang tahun, anniversari, atau ungkapan rasa cinta."}	{"sizeId": "S", "description": "kuning", "selectedAddonIds": ["vase"], "referenceImagePath": null}	225000	selesai	cod	COD (Bayar di Tempat)	\N	2026-06-20 22:30:01.768136+07
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_methods (id, label, detail, needs_proof) FROM stdin;
transfer_bca	Transfer BCA	BCA 1234567890  •  a/n Faedah Shop	t
transfer_mandiri	Transfer Mandiri	Mandiri 0987654321  •  a/n Faedah Shop	t
gopay	GoPay	0812-3456-7890  •  (Faedah Shop)	t
ovo	OVO	0812-3456-7890  •  (Faedah Shop)	t
cod	COD (Bayar di Tempat)	Bayar tunai saat pesanan tiba	f
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, base_price, image, category, sizes, addons, created_at) FROM stdin;
p1	Classic Rose Bouquet	Rangkaian mawar klasik yang elegan dan mewah. Cocok untuk berbagai momen spesial seperti ulang tahun, anniversari, atau ungkapan rasa cinta.	150000	https://images.unsplash.com/photo-1487530811176-3780de880c2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600	Mawar	[{"id": "S", "label": "Kecil", "stems": "5–7 tangkai", "priceMultiplier": 1}, {"id": "M", "label": "Sedang", "stems": "10–15 tangkai", "priceMultiplier": 1.7}, {"id": "L", "label": "Besar", "stems": "20–25 tangkai", "priceMultiplier": 2.4}, {"id": "XL", "label": "Extra Besar", "stems": "30+ tangkai", "priceMultiplier": 3.2}]	[{"id": "vase", "label": "Vas Bunga", "price": 75000}, {"id": "ribbon", "label": "Pita Premium", "price": 25000}, {"id": "card", "label": "Kartu Ucapan", "price": 15000}, {"id": "wrap", "label": "Wrapping Mewah", "price": 40000}]	2026-06-20 22:15:58.75777+07
p2	Pink Romance	Perpaduan mawar pink dan putih yang romantis, didekorasi dengan dedaunan hijau segar. Pilihan sempurna untuk mengungkapkan kasih sayang.	175000	https://images.unsplash.com/photo-1523693916903-027d144a2b7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600	Mawar	[{"id": "S", "label": "Kecil", "stems": "5–7 tangkai", "priceMultiplier": 1}, {"id": "M", "label": "Sedang", "stems": "10–15 tangkai", "priceMultiplier": 1.7}, {"id": "L", "label": "Besar", "stems": "20–25 tangkai", "priceMultiplier": 2.4}, {"id": "XL", "label": "Extra Besar", "stems": "30+ tangkai", "priceMultiplier": 3.2}]	[{"id": "vase", "label": "Vas Bunga", "price": 75000}, {"id": "ribbon", "label": "Pita Premium", "price": 25000}, {"id": "card", "label": "Kartu Ucapan", "price": 15000}, {"id": "wrap", "label": "Wrapping Mewah", "price": 40000}]	2026-06-20 22:15:58.759249+07
p3	Tropical Garden Mix	Perpaduan bunga-bunga tropis berwarna-warni yang segar dan menawan. Tampilan unik yang membuatnya berbeda dari buket biasa.	130000	https://images.unsplash.com/photo-1572454591674-2739f30d8c40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600	Campur	[{"id": "S", "label": "Kecil", "stems": "5–7 tangkai", "priceMultiplier": 1}, {"id": "M", "label": "Sedang", "stems": "10–15 tangkai", "priceMultiplier": 1.7}, {"id": "L", "label": "Besar", "stems": "20–25 tangkai", "priceMultiplier": 2.4}, {"id": "XL", "label": "Extra Besar", "stems": "30+ tangkai", "priceMultiplier": 3.2}]	[{"id": "vase", "label": "Vas Bunga", "price": 75000}, {"id": "ribbon", "label": "Pita Premium", "price": 25000}, {"id": "card", "label": "Kartu Ucapan", "price": 15000}, {"id": "wrap", "label": "Wrapping Mewah", "price": 40000}]	2026-06-20 22:15:58.759952+07
p4	Dried Floral Collection	Rangkaian bunga kering premium dengan tekstur unik dan nuansa bohemian. Tahan lama dan cocok sebagai dekorasi rumah.	140000	https://images.unsplash.com/photo-1622658641561-fe2ca339b039?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600	Bunga Kering	[{"id": "S", "label": "Kecil", "stems": "5–8 tangkai", "priceMultiplier": 1}, {"id": "M", "label": "Sedang", "stems": "12–15 tangkai", "priceMultiplier": 1.6}, {"id": "L", "label": "Besar", "stems": "20–25 tangkai", "priceMultiplier": 2.3}, {"id": "XL", "label": "Extra Besar", "stems": "30+ tangkai", "priceMultiplier": 3}]	[{"id": "frame", "label": "Frame Gantung", "price": 95000}, {"id": "ribbon", "label": "Pita Satin", "price": 25000}, {"id": "card", "label": "Kartu Ucapan", "price": 15000}, {"id": "wrap", "label": "Kraft Paper Wrap", "price": 30000}]	2026-06-20 22:15:58.760479+07
p5	Sunflower Joy	Buket bunga matahari ceria yang memancarkan kehangatan dan kebahagiaan. Pilihan tepat untuk menyemangati orang-orang tersayang.	115000	https://images.unsplash.com/photo-1601884928885-92a922f7962f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600	Bunga Matahari	[{"id": "S", "label": "Kecil", "stems": "5–7 tangkai", "priceMultiplier": 1}, {"id": "M", "label": "Sedang", "stems": "10–15 tangkai", "priceMultiplier": 1.7}, {"id": "L", "label": "Besar", "stems": "20–25 tangkai", "priceMultiplier": 2.4}, {"id": "XL", "label": "Extra Besar", "stems": "30+ tangkai", "priceMultiplier": 3.2}]	[{"id": "vase", "label": "Vas Bunga", "price": 75000}, {"id": "ribbon", "label": "Pita Premium", "price": 25000}, {"id": "card", "label": "Kartu Ucapan", "price": 15000}, {"id": "wrap", "label": "Wrapping Mewah", "price": 40000}]	2026-06-20 22:15:58.76098+07
p6	Tulip Garden	Rangkaian tulip segar yang anggun dan minimalis. Tersedia dalam berbagai warna pilihan sesuai permintaanmu.	165000	https://images.unsplash.com/photo-1586968295564-92fd7572718b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600	Tulip	[{"id": "S", "label": "Kecil", "stems": "5–7 tangkai", "priceMultiplier": 1}, {"id": "M", "label": "Sedang", "stems": "10–12 tangkai", "priceMultiplier": 1.6}, {"id": "L", "label": "Besar", "stems": "18–20 tangkai", "priceMultiplier": 2.2}, {"id": "XL", "label": "Extra Besar", "stems": "25+ tangkai", "priceMultiplier": 2.9}]	[{"id": "vase", "label": "Vas Bunga", "price": 75000}, {"id": "ribbon", "label": "Pita Premium", "price": 25000}, {"id": "card", "label": "Kartu Ucapan", "price": 15000}, {"id": "wrap", "label": "Wrapping Mewah", "price": 40000}]	2026-06-20 22:15:58.761428+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, name, role, created_at) FROM stdin;
94d3667b-d5fd-41b9-8832-3b85772e3c54	owner@gmail.com	$2a$10$2dPMYRj9wagdsHvyknFPr.69KnF4ojra4ssAObjcBLYU/peF6GmlW	Owner	owner	2026-06-20 22:28:31.032676+07
6e808937-c15d-4550-a235-c7cf8814e050	admin@gmail.com	$2a$10$1qRTmtH8wLjeWVAEd6e33uQfiW.Jf7g9HcM7BiLdXY8GnO2S/Cp9e	Admin	admin	2026-06-20 22:29:21.263513+07
795bf2ad-a2c3-403d-91df-4d8d88852ad1	rafli@gmail.com	$2a$10$GFVn6bJQCGAnlkai3O7lmOXFlEXBH0XCnWbOE4xkee0reUMMnIcSC	rafli	customer	2026-06-20 22:29:36.294822+07
\.


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict Q6v8a9oje9jCgKCushZ38IjDtfwOsx5yaX2tfYs5M39YvOvBHaZmt2rHdu5nAuJ

