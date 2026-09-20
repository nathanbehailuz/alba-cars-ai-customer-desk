-- Expose reference helper to PostgREST (service_role / authenticated)
grant usage on sequence public.lead_reference_seq to service_role, authenticated;
grant execute on function public.next_lead_reference() to service_role, authenticated;
