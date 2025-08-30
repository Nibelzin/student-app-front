  {/* Top grid: Próximas atividades & Notas Rápidas */}
            <section className="grid gap-12 lg:grid-cols-3">
                {/* Próximas atividades */}
                {
                    NEXT_ACTIVITIES_PLACEHOLDER.length === 0 ? (
                        <div className="lg:col-span-2">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">Próximas atividades</h2>
                            <Card className="flex items-center justify-center h-64 bg-neutral-50 p-4 text-center text-neutral-500 dark:bg-neutral-900/40">
                                Nenhuma atividade próxima
                            </Card>
                        </div>
                    ) : (
                        <div className="lg:col-span-2">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">Próximas atividades</h2>
                            <div className="flex flex-col gap-3">
                                {NEXT_ACTIVITIES_PLACEHOLDER.map(activity => (
                                    <Card
                                        key={activity.id}
                                        className="flex flex-col p-4 bg-neutral-50 dark:bg-neutral-900/40"
                                    >
                                        <p className=''>{activity.title}</p>
                                        <p className='text-lg'>{activity.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Notas rápidas */}
                <div>
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">Notas Rápidas</h2>
                    <div className="flex flex-col gap-3">
                        {QUICK_NOTES_PLACEHOLDER.map((_, i) => (
                            <Card
                                key={i}
                                className="h-12 bg-neutral-50 p-3 dark:bg-neutral-900/40"
                                aria-label={`Nota rápida placeholder ${i + 1}`}
                            >
                                <Skeleton className="h-full w-full" />
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Arquivos */}
            <section className="mt-16">
                <header className="mb-6 space-y-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Arquivos</h2>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="subject-filter" className="text-xs font-medium text-neutral-500">Matéria</label>
                        <select
                            id="subject-filter"
                            className="h-9 w-40 rounded-md border border-neutral-300 bg-white px-2 text-sm outline-none ring-0 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900"
                            defaultValue="all"
                        >
                            <option value="all">Todas</option>
                            <option value="ads">ADS</option>
                            <option value="matematica">Matemática</option>
                        </select>
                    </div>
                </header>
                <Card className="h-72 bg-neutral-50 p-4 dark:bg-neutral-900/40">
                    <Skeleton className="h-full w-full" />
                </Card>
            </section>