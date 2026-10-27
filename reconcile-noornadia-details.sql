BEGIN;

SELECT pg_advisory_xact_lock(hashtext('employee-number:HGMS'));

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS guard_type_code varchar(10),
  ADD COLUMN IF NOT EXISTS nationality varchar(50),
  ADD COLUMN IF NOT EXISTS state_code varchar(10),
  ADD COLUMN IF NOT EXISTS gender varchar(20),
  ADD COLUMN IF NOT EXISTS telephone_number varchar(50),
  ADD COLUMN IF NOT EXISTS residential_address text,
  ADD COLUMN IF NOT EXISTS normal_ot_monthly_target numeric(10, 2),
  ADD COLUMN IF NOT EXISTS work_shift varchar(100),
  ADD COLUMN IF NOT EXISTS ot_shift varchar(100),
  ADD COLUMN IF NOT EXISTS off_day varchar(20);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = 'ef52a3be-07da-43bc-adf7-b5b84fcea113'::uuid
      AND employee_no IN ('LCL018', 'HGMS001')
      AND full_name = 'NOORNADIA SHAFIDA BINTI SAINI'
  ) THEN
    RAISE EXCEPTION 'Expected Noornadia employee record was not found';
  END IF;
END $$;

UPDATE public.employees
SET employee_no = 'HGMS001',
    full_name = 'NOORNADIA SHAFIDA BINTI SAINI',
    ic_number = '920820-04-5194',
    "position" = 'Head Guard',
    basic_salary = 1700.00,
    bank_name = 'MBB',
    account_number = '162478269003',
    epf_number = '21976749',
    socso_number = '920820045194',
    created_date = DATE '2026-10-01',
    guard_type_code = 'HG',
    nationality = 'Malaysian',
    state_code = 'S',
    gender = 'Female',
    telephone_number = '013-3567639',
    residential_address = 'PANGSAPURI D''CENDANA ,SETIA ALAM PERSIARAN SETIA MAKMUR,SHAH ALAM SELANGOR ,40710',
    normal_ot_monthly_target = 1200.00,
    work_shift = '7.00am-3.00pm',
    ot_shift = '3.00pm-7.00pm',
    off_day = 'Sunday',
    updated_at = now()
WHERE id = 'ef52a3be-07da-43bc-adf7-b5b84fcea113'::uuid
  AND employee_no IN ('LCL018', 'HGMS001');

DO $$
BEGIN
  IF (SELECT count(*) FROM public.employees WHERE employee_no = 'HGMS001') <> 1
     OR (SELECT count(*) FROM public.employees WHERE employee_no = 'HGMS001' AND full_name = 'NOORNADIA SHAFIDA BINTI SAINI' AND "position" = 'Head Guard' AND created_date = DATE '2026-10-01' AND basic_salary = 1700.00 AND normal_ot_monthly_target = 1200.00) <> 1 THEN
    RAISE EXCEPTION 'Noornadia reconciliation validation failed';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.assign_employee_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  category_prefix text;
  next_number integer;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.employee_no = OLD.employee_no THEN RETURN NEW; END IF;
  IF NEW.employee_no !~ '^[A-Z]{2}[MI][0-9]{3}$' THEN
    RAISE EXCEPTION 'Employee number must follow [GuardType][Nationality][001-999]';
  END IF;
  category_prefix := left(NEW.employee_no, 3);
  PERFORM pg_advisory_xact_lock(hashtext('employee-number:' || category_prefix));
  SELECT coalesce(max(right(employee_no, 3)::integer), 0) + 1 INTO next_number
  FROM public.employees
  WHERE employee_no ~ ('^' || category_prefix || '[0-9]{3}$') AND id IS DISTINCT FROM NEW.id;
  IF right(NEW.employee_no, 3)::integer <> next_number THEN
    RAISE EXCEPTION 'Next employee number for % is %', category_prefix, category_prefix || lpad(next_number::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS employees_assign_number ON public.employees;
CREATE TRIGGER employees_assign_number
BEFORE INSERT OR UPDATE OF employee_no ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.assign_employee_number();

COMMIT;

SELECT employee_no, full_name, "position", ic_number, nationality, state_code,
       created_date, basic_salary, normal_ot_monthly_target
FROM public.employees WHERE employee_no = 'HGMS001';
