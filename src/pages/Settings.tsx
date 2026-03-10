import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCurrentUser } from "@/hooks/use-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, Monitor } from "lucide-react"

export default function Settings() {
    const { data: user } = useCurrentUser()
    const { theme, setTheme } = useTheme()

    return (
        <div className="mx-auto w-full max-w-screen-2xl p-8 mb-16 sm:p-6 md:p-12 lg:px-12 xl:px-24 2xl:px-32 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie as configurações da sua conta e preferências do aplicativo.
                </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium">Perfil</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Atualize suas informações pessoais e como você aparece na plataforma.
                    </p>
                </div>
                <div className="md:col-span-3">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Seu Perfil</CardTitle>
                            <CardDescription>
                                Informações básicas visíveis para você.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
                                    <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Alterar Avatar</Button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input id="name" defaultValue={user?.name} placeholder="Seu nome" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input id="email" type="email" defaultValue={user?.email} placeholder="seu@email.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="institution">Instituição de Ensino</Label>
                                    <Input id="institution" placeholder="Nome da sua faculdade ou escola" />
                                </div>
                                <div className="pt-2">
                                    <Button className="w-full sm:w-auto">Salvar Alterações</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium">Preferências</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Personalize sua experiência no aplicativo.
                    </p>
                </div>
                <div className="md:col-span-3">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Notificações</CardTitle>
                            <CardDescription>
                                Controle os alertas e e-mails que você recebe.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Resumo Semanal</Label>
                                    <p className="text-sm text-muted-foreground">Receba um e-mail com o resumo das suas atividades.</p>
                                </div>
                                <Button variant="outline" size="sm">Configurar</Button>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Lembretes de Prazo</Label>
                                    <p className="text-sm text-muted-foreground">Seja avisado antes do prazo de entrega das atividades.</p>
                                </div>
                                <Button variant="outline" size="sm">Configurar</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none mt-6">
                        <CardHeader>
                            <CardTitle>Aparência</CardTitle>
                            <CardDescription>
                                Escolha o tema do aplicativo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setTheme('light')}
                                >
                                    <Sun className="w-4 h-4 mr-2" />
                                    Claro
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setTheme('dark')}
                                >
                                    <Moon className="w-4 h-4 mr-2" />
                                    Escuro
                                </Button>
                                <Button
                                    variant={theme === 'system' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setTheme('system')}
                                >
                                    <Monitor className="w-4 h-4 mr-2" />
                                    Sistema
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium text-destructive">Zona de Perigo</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Ações críticas e irreversíveis.
                    </p>
                </div>
                <div className="md:col-span-3">
                    <Card className="border-destructive/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-destructive">Excluir Conta</CardTitle>
                            <CardDescription>
                                Ao excluir sua conta, todos os seus dados, matérias e atividades serão permanentemente apagados e não poderão ser recuperados.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive">Excluir minha conta</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
