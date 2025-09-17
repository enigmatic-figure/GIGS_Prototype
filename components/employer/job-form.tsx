"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateTimeRangePicker, type DateTimeRange } from "@/components/date-time-range-picker";
import { SkillMultiSelect } from "@/components/skill-multi-select";
import { RateInput } from "@/components/rate-input";
import { AddressInput } from "@/components/address-input";
import { createJobPostingSchema } from "@/lib/schemas";
import { LIMITS, STAFF_ROLES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const jobFormSchema = createJobPostingSchema.extend({
  title: z.string().min(5),
  description: z.string().min(20),
  start: z.date(),
  end: z.date(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

type EmployerJobFormProps = {
  employerId: string;
};

export function EmployerJobForm({ employerId }: EmployerJobFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [range, setRange] = useState<DateTimeRange>({ start: null, end: null });
  const [locationValue, setLocationValue] = useState({ address: "", lat: "", lng: "" });

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      employerId,
      title: "",
      description: "",
      location: "",
      neededRoles: [],
      headcount: 5,
      rate: LIMITS.MIN_HOURLY_RATE,
      start: new Date(),
      end: new Date(),
      lat: undefined,
      lng: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: JobFormValues) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to create job" }));
        throw new Error(body.message ?? "Unable to create job");
      }
      return (await response.json()) as { job: { id: string } };
    },
    onSuccess: ({ job }) => {
      toast({ title: "Job posted", description: "We’ll start matching workers right away." });
      router.push(`/employer/jobs/${job.id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Unable to create job", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (values: JobFormValues) => {
    if (!range.start || !range.end) {
      toast({
        title: "Missing schedule",
        description: "Select start and end times for the job.",
        variant: "destructive",
      });
      return;
    }

    const lat = Number.parseFloat(String(locationValue.lat));
    const lng = Number.parseFloat(String(locationValue.lng));

    mutation.mutate({
      ...values,
      employerId,
      start: range.start,
      end: range.end,
      lat: Number.isNaN(lat) ? undefined : lat,
      lng: Number.isNaN(lng) ? undefined : lng,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Summer Concert Setup Crew" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do workers need to know?</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Describe duties, arrival instructions, wardrobe, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <AddressInput
                  value={{
                    address: field.value,
                    lat: locationValue.lat,
                    lng: locationValue.lng,
                  }}
                  onChange={(next) => {
                    field.onChange(next.address);
                    setLocationValue(next);
                  }}
                  description="Exact location helps us match by commute time."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="neededRoles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roles needed</FormLabel>
              <FormControl>
                <SkillMultiSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={STAFF_ROLES.map((role) => ({ value: role, label: role }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="headcount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total workers</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly rate</FormLabel>
                <FormControl>
                  <RateInput
                    value={field.value}
                    onChange={field.onChange}
                    min={LIMITS.MIN_HOURLY_RATE}
                    max={LIMITS.MAX_HOURLY_RATE}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Schedule</FormLabel>
          <DateTimeRangePicker value={range} onChange={setRange} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Publish job
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
