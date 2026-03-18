import React from 'react';
import OptimizedImage from '../../../OptimizedImage';

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
}

interface TeamCardsDefaultProps {
  title?: string;
  description?: string;
  maxItems?: number;
  members?: TeamMember[];
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { name: 'Especialista Exemplo', role: 'Estratégia', bio: 'Atuação consultiva com foco em execução.' },
  { name: 'Analista Exemplo', role: 'Operações', bio: 'Coordenação de processos e melhoria contínua.' },
];

const TeamCardsDefault: React.FC<TeamCardsDefaultProps> = ({
  title = 'Time Especialista',
  description = 'Profissionais responsáveis por conduzir o projeto do diagnóstico à execução.',
  maxItems = 4,
  members,
}) => {
  const list = (members && members.length > 0 ? members : DEFAULT_MEMBERS)
    .filter((member) => member.name && member.role)
    .slice(0, Math.max(1, Number(maxItems || 4)));

  if (list.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {list.map((member, index) => (
            <article key={`${member.name}-${index}`} className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
              {member.imageUrl ? (
                <OptimizedImage
                  src={member.imageUrl}
                  alt={member.name}
                  pageKey="home"
                  role="card"
                  className="w-full h-52 object-cover"
                  effect=""
                  priority={index < 2}
                />
              ) : null}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm font-medium text-blue-800 mt-1">{member.role}</p>
                {member.bio ? <p className="text-gray-700 mt-3">{member.bio}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamCardsDefault;
