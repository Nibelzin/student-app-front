import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { login } from '@/api/authService'

const loginSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
})

type LoginFormData = z.infer<typeof loginSchema>

function Login() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      await login({ email: data.email, password: data.password })
      navigate('/')
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        form.resetField('password')
      }
    } finally {
      setIsLoading(false)
    }


  }

  useEffect(() => {
    if (searchParams.get('registered')) {
      setShowSuccessMessage(true)
      searchParams.delete('registered')
      setSearchParams(searchParams)

      const fadeTimer = setTimeout(() => {
        setIsFading(true)
      }, 6000)

      const removeTimer = setTimeout(() => {
        setShowSuccessMessage(false)
        setIsFading(false)
      }, 6500)

    }
  }, [searchParams, setSearchParams])

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

        {showSuccessMessage && (
          <Alert className={`mb-4 border-green-200 bg-green-50 transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <CheckCircle2 className="h-4 w-4" color='#016630' />
            <AlertDescription className='text-green-800'>
              Conta criada com sucesso! Faça login para continuar.
            </AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card className="border shadow-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Digite seu e-mail e senha para acessar
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 mb-2">
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='seu@email.com' {...field} disabled={isLoading} />
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
                      <div className='flex justify-between items-center'>
                        <FormLabel>Senha</FormLabel>
                        <a href="" className='text-sm text-neutral-500 hover:text-neutral-700'>Esqueci minha senha</a>
                      </div>
                      <FormControl>
                        <div className='relative'>
                          <Input type={showPassword ? 'text' : 'password'} placeholder='••••••••' {...field} disabled={isLoading} />
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='absolute right-0 top-0 h-full px-3 hover:bg-transparent cursor-pointer'
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
                <p className="text-sm text-center text-neutral-500">
                  Não tem uma conta?{' '}
                  <a href="/register" className="font-medium text-neutral-900 hover:underline">
                    Criar conta
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

export default Login
