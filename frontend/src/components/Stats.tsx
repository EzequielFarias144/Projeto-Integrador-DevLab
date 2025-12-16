const stats = [
  { value: "1000+", label: "Estudantes Ativos" },
  { value: "250+", label: "Projetos Concluídos" },
  { value: "50+", label: "Professores" },
  { value: "98%", label: "Satisfação" },
];

const Stats = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">
                {stat.value}
              </div>
              <p className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;