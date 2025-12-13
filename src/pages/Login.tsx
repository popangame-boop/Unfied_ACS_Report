"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

// IMPORTANT: You need to create a user in Supabase Auth with this email
// and set the password to be your "special code".
const FIXED_LOGIN_EMAIL = "admin@example.com"; 

const formSchema = z.object({
  specialCode: z.string().min(1, { message: "Kode khusus diperlukan." }),
});

const Login = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialCode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: FIXED_LOGIN_EMAIL,
      password: values.specialCode,
    });

    if (error) {
      showError(`Gagal masuk: ${error.message}`);
    }
    // The onAuthStateChange listener in SessionContextProvider will handle successful login redirect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-xl shadow-subtle">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Masuk</CardTitle>
          <CardDescription className="text-center">
            Masukkan kode khusus Anda untuk melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="specialCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Khusus</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-vibrant-purple hover:bg-vibrant-purple/90 text-white rounded-md shadow-sm">
                Masuk
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;