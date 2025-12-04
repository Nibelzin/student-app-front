import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Eye, EyeOff, GraduationCap, Loader2, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createUser } from '@/api/userService'
import { useCreateUser } from '@/hooks/use-user'

const passwordRequirements = [
    { regex: /.{6,}/, message: 'Pelo menos 6 caracteres' },
    { regex: /[A-Z]/, message: 'Uma letra maiúscula' },
    { regex: /[a-z]/, message: 'Uma letra minúscula' },
    { regex: /[0-9]/, message: 'Um número' },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'Um caractere especial (!@#$%...)' }
]

const registerSchema = z.object({
    name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres' }),
    email: z.email({ message: 'E-mail inválido' }),
    password: z.string()
        .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
        .regex(/[A-Z]/, { message: 'Deve conter uma letra maiúscula' })
        .regex(/[a-z]/, { message: 'Deve conter uma letra minúscula' })
        .regex(/[0-9]/, { message: 'Deve conter um número' })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Deve conter um caractere especial' }),
    confirmPassword: z.string().min(6, { message: 'A confirmação de senha deve ter pelo menos 6 caracteres' }),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    })

type RegisterFormData = z.infer<typeof registerSchema>

function PasswordRequirement({ meets, label }: { meets: boolean, label: string }) {
    return (
        <div className={`flex items-center gap-2 text-sm ${meets ? 'text-green-600' : 'text-red-600'}`}>
            {meets ? <Check className='h-4 w-4' /> : <X className='h-4 w-4' />}
            <span>{label}</span>
        </div>
    )
}

function Register() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const { mutate: createUser, isPending, error } = useCreateUser()

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    })

    const password = form.watch('password')

    const onSubmit = async (data: RegisterFormData) => {
        setErrorMessage(null)

        createUser({
            name: data.name,
            email: data.email,
            password: data.password,
        }, {
            onSuccess: () => {
                navigate('/login?registered=true')
            },
            onError: (err) => {
                if (err instanceof Error) {
                    setErrorMessage(err.message)
                }
                console.log('ERRO QUERY', error)
            }
        })
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 rounded-xl bg-neutral-900 flex items-center justify-center mb-4">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Student App</h1>
                    <p className="text-sm text-neutral-500 mt-1">Gerencie seus estudos de forma inteligente</p>
                </div>

                {/* Login Card */}
                <Card className="border shadow-none">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl">Criar conta</CardTitle>
                        <CardDescription>
                            Cadastre-se para começar a gerenciar seus estudos
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-4 mb-2">
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome</FormLabel>
                                            <FormControl>
                                                <Input type='text' placeholder='Seu nome' {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type='email' placeholder='seu@email.com' {...field} disabled={isPending} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='password'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <div className='relative'>
                                                    <Input type={showPassword ? 'text' : 'password'} placeholder='••••••••' {...field} disabled={isPending} />
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='icon'
                                                        className='absolute right-0 top-0 h-full px-3 hover:bg-transparent cursor-pointer'
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={isPending}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff size={20} className='opacity-50' />)
                                                            : (
                                                                <Eye size={20} />
                                                            )
                                                        }
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            {password && (
                                                <div className='mt-3 p-3 border shadow-inner rounded-md space-y-1'>
                                                    {passwordRequirements.map((requirement, index) => (
                                                        <PasswordRequirement
                                                            key={index}
                                                            meets={requirement.regex.test(password)}
                                                            label={requirement.message}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='confirmPassword'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmar Senha</FormLabel>
                                            <FormControl>
                                                <div className='relative'>
                                                    <Input type={showConfirmPassword ? 'text' : 'password'} placeholder='••••••••' {...field} disabled={isPending} />
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='icon'
                                                        className='absolute right-0 top-0 h-full px-3 hover:bg-transparent cursor-pointer'
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        disabled={isPending}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff size={20} className='opacity-50' />)
                                                            : (
                                                                <Eye size={20} />
                                                            )
                                                        }
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4 pt-2">
                                {errorMessage && (
                                    <p className="text-sm text-red-600 text-center">
                                        {errorMessage}
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base cursor-pointer"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Cadastrando...
                                        </>
                                    ) : (
                                        'Cadastrar-se'
                                    )}
                                </Button>
                                <p className="text-sm text-center text-neutral-500">
                                    Já tem uma conta?{' '}
                                    <a href="/login" className="font-medium text-neutral-900 hover:underline">
                                        Entrar
                                    </a>
                                </p>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>

                {/* Footer */}
                <p className="text-xs text-center text-neutral-400 mt-8">
                    Ao continuar, você concorda com nossos{' '}
                    <a href="#" className="underline hover:text-neutral-600">Termos de Uso</a>
                    {' '}e{' '}
                    <a href="#" className="underline hover:text-neutral-600">Política de Privacidade</a>
                </p>
            </div>
        </main >
    )
}

export default Register
