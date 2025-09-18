"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
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
import { SkillMultiSelect } from "@/components/skill-multi-select";
import { RateInput } from "@/components/rate-input";
import { AddressInput } from "@/components/address-input";
import { workerProfileInputSchema } from "@/lib/schemas";
import { LIMITS, STAFF_ROLES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const formSchema = workerProfileInputSchema;

type WorkerProfileFormValues = z.infer<typeof formSchema>;

type WorkerProfileFormProps = {
  workerId: string;
  defaultValues: WorkerProfileFormValues;
};

export function WorkerProfileForm({ workerId, defaultValues }: WorkerProfileFormProps) {
  const { toast } = useToast();
  const [addressValue, setAddressValue] = useState({
    address: "",
    lat: defaultValues.homeLat.toString(),
    lng: defaultValues.homeLng.toString(),
  });

  const form = useForm<WorkerProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const skillsOptions = useMemo(
    () => STAFF_ROLES.map((role) => ({ value: role, label: role })),
    []
  );

  const mutation = useMutation({
    mutationFn: async (values: WorkerProfileFormValues) => {
      const response = await fetch(`/api/workers/${workerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to update worker" }));
        throw new Error(body.message ?? "Unable to update worker");
      }

      return (await response.json()) as { worker: unknown };
    },
    onSuccess: () => {
      toast({
        title: "Profile saved",
        description: "Your availability and preferences have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: WorkerProfileFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Core skills</FormLabel>
              <FormDescription>Select at least one role you can confidently perform.</FormDescription>
              <FormControl>
                <SkillMultiSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={skillsOptions}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="minRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum hourly rate</FormLabel>
                <FormControl>
                  <RateInput
                    value={field.value}
                    onChange={(next) => {
                      field.onChange(next);
                      const currentMax = form.getValues("maxRate");
                      if (next > currentMax) {
                        form.setValue("maxRate", next);
                      }
                    }}
                    min={LIMITS.MIN_HOURLY_RATE}
                    max={form.watch("maxRate")}
                  />
                </FormControl>
                <FormDescription>Employers will only see jobs at or above this rate.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum hourly rate</FormLabel>
                <FormControl>
                  <RateInput
                    value={field.value}
                    onChange={field.onChange}
                    min={form.watch("minRate")}
                    max={LIMITS.MAX_HOURLY_RATE}
                  />
                </FormControl>
                <FormDescription>Use this to indicate the top end of your preferred range.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="radiusKm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Travel radius (km)</FormLabel>
              <FormDescription>We use this to suggest jobs close to you.</FormDescription>
              <FormControl>
                <Input
                  type="number"
                  min={LIMITS.MIN_RADIUS_KM}
                  max={LIMITS.MAX_RADIUS_KM}
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
          name="homeLat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Home base</FormLabel>
              <FormDescription>Provide your home coordinates for precise matching.</FormDescription>
              <FormControl>
                <AddressInput
                  value={{
                    address: addressValue.address,
                    lat: addressValue.lat,
                    lng: addressValue.lng,
                  }}
                  onChange={(next) => {
                    setAddressValue(next);
                    const lat = Number.parseFloat(String(next.lat));
                    const lng = Number.parseFloat(String(next.lng));
                    if (!Number.isNaN(lat)) {
                      field.onChange(lat);
                    }
                    if (!Number.isNaN(lng)) {
                      form.setValue("homeLng", lng);
                    }
                  }}
                  description="Latitude/longitude are required for auto-matching."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending} className="min-w-[160px]">
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save profile
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
