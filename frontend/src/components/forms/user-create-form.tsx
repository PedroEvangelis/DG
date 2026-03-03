import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { USER_GENDERS, type UserGender } from "@/constants/userGender";
import { USER_TYPES, type UserType } from "@/constants/userType";

const addressSchema = z.object({
  zipCode: z.string().min(8, "CEP inválido"),
  street: z.string().min(1, "Obrigatório"),
  number: z.string().min(1, "Obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Obrigatório"),
  city: z.string().min(1, "Obrigatório"),
  state: z.string().length(2, "UF inválida"),
});

const userFormSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(USER_TYPES.PF),
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    cpf: z.string().min(11, "CPF inválido"),
    dob: z.string().min(1, "Data é obrigatória"),
    gender: z.enum([USER_GENDERS.MALE, USER_GENDERS.FEMALE, USER_GENDERS.OTHER, USER_GENDERS.NOT_DECLARED]),
    ...addressSchema.shape,
  }),
  z.object({
    type: z.literal(USER_TYPES.PJ),
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    cnpj: z.string().min(14, "CNPJ inválido"),
    corporateName: z.string().min(1, "Razão Social é obrigatória"),
    tradeName: z.string().min(1, "Nome Fantasia é obrigatório"),
    ...addressSchema.shape,
  }),
]);

type UserFormValues = z.infer<typeof userFormSchema>;

interface FormInputProps {
  field: any;
  label: string;
  type?: string;
  placeholder?: string;
}

const FormFieldWrapper = ({ field, label, type = "text", placeholder }: FormInputProps) => {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
};

export function UserCreateForm() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: createAddress } = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      await api.addresses.user({ userId }).post({
        cep: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      });
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const { zipCode, street, number, complement, neighborhood, city, state, ...userData } = values;
      const response = await api.users.post(userData);
      
      if (response.error) throw response.error;
			
			const { data } = response.data;

      if (data?.id) {
        await createAddress({ userId: data.id, data: values });
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Usuário e endereço criados com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      const message = error?.value.message;
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: {
      type: USER_TYPES.PF,
      name: "", email: "", password: "",
      cpf: "", dob: "", gender: USER_GENDERS.NOT_DECLARED,
      cnpj: "", corporateName: "", tradeName: "",
      zipCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
    } as UserFormValues,
    validators: { onChange: userFormSchema },
    onSubmit: ({ value }) => mutate(value),
  });

	const { mutate: handleCepLookup, isPending: isLookingUpCep } = useMutation({
		mutationFn: async (cep: string) => {
			const response = await api.integrations.cep({ cep }).get(); 
			if (response.error) throw new Error("CEP não encontrado");
			return response.data;
		},
		onSuccess: ({ data }) => {
			if (data) {
				form.setFieldValue("street", data.logradouro);
				form.setFieldValue("neighborhood", data.bairro);
				form.setFieldValue("city", data.localidade);
				form.setFieldValue("state", data.uf);
				toast.success("Endereço preenchido automaticamente!");
			}
		},
		onError: () => {
			toast.error("Não foi possível localizar o CEP.");
		},
	});

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Novo usuário <Plus className="ml-2 h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar novo usuário</DialogTitle>
          <DialogDescription>Preencha os dados abaixo para cadastrar.</DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
          <FieldGroup className="space-y-6">
            
            {/* Seletor de Tipo */}
            <form.Field name="type" children={(field) => (
              <Field>
                <FieldLabel>Tipo de Cadastro</FieldLabel>
                <Select value={field.state.value} onValueChange={e => field.handleChange(e as UserType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_TYPES.PF}>Pessoa Física</SelectItem>
                    <SelectItem value={USER_TYPES.PJ}>Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="name" children={(field) => <FormFieldWrapper field={field} label="Nome Completo" />} />
              <form.Field name="email" children={(field) => <FormFieldWrapper field={field} label="E-mail" type="email" />} />
              <form.Field name="password" children={(field) => <FormFieldWrapper field={field} label="Senha" type="password" />} />

              <form.Subscribe selector={(state) => state.values.type}>
                {(type) => type === "pf" ? (
                  <>
                    <form.Field name="cpf" children={(field) => <FormFieldWrapper field={field} label="CPF" />} />
                    <form.Field name="dob" children={(field) => <FormFieldWrapper field={field} label="Data de Nascimento" type="date" />} />
                    <form.Field name="gender" children={(field) => (
                      <Field>
                        <FieldLabel>Gênero</FieldLabel>
                        <Select value={field.state.value} onValueChange={e => field.handleChange(e as UserGender)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={USER_GENDERS.MALE}>Masculino</SelectItem>
                            <SelectItem value={USER_GENDERS.FEMALE}>Feminino</SelectItem>
                            <SelectItem value={USER_GENDERS.OTHER}>Outro</SelectItem>
                            <SelectItem value={USER_GENDERS.NOT_DECLARED}>Não declarado</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    )} />
                  </>
                ) : (
                  <>
                    <form.Field name="cnpj" children={(field) => <FormFieldWrapper field={field} label="CNPJ" />} />
                    <form.Field name="corporateName" children={(field) => <FormFieldWrapper field={field} label="Razão Social" />} />
                    <form.Field name="tradeName" children={(field) => <FormFieldWrapper field={field} label="Nome Fantasia" />} />
                  </>
                )}
              </form.Subscribe>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <form.Field
									name="zipCode"
									children={(field) => (
										<Field data-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
											<FieldLabel htmlFor={field.name}>
												CEP {isLookingUpCep && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
											</FieldLabel>
											<Input
												id={field.name}
												placeholder="00000-000"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const value = e.target.value.replace(/\D/g, ""); 
													field.handleChange(value);
													
													if (value.length === 8) {
														handleCepLookup(value);
													}
												}}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								/>
                <form.Field name="street" children={(field) => <FormFieldWrapper field={field} label="Rua" />} />
                <form.Field name="number" children={(field) => <FormFieldWrapper field={field} label="Número" />} />
                <form.Field name="neighborhood" children={(field) => <FormFieldWrapper field={field} label="Bairro" />} />
                <form.Field name="city" children={(field) => <FormFieldWrapper field={field} label="Cidade" />} />
                <form.Field name="state" children={(field) => <FormFieldWrapper field={field} label="UF" />} />
              </div>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-8">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit]) => (
                <Button type="submit" disabled={!canSubmit || isPending} className="w-full md:w-auto">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPending ? "Cadastrando..." : "Finalizar Cadastro"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}