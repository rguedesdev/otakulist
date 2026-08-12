import Image from "next/image";
import Link from "next/link";

import {
  FiArrowDown,
  FiArrowUp,
  FiCalendar,
  FiChevronDown,
  FiExternalLink,
  FiInfo,
  FiMinus,
  FiTrendingUp,
} from "react-icons/fi";
import { GiEvilBook } from "react-icons/gi";
import { LuBookHeart } from "react-icons/lu";
import { RiBarChartBoxLine, RiBookShelfLine } from "react-icons/ri";

import styles from "./oriconranking.module.css";

type Category = "manga" | "light-novel";

type SalesEntry = {
  position: number;
  previousPosition?: number;
  trackerTitle: string;
  sourceTitle: string;
  volume: string;
  publisher: string;
  author: string;
  weeklySales: number;
  monthlySales: number;
  yearlySales: number;
  cumulativeSales?: number;
  image?: string;
  href?: string;
};

const mangaEntries: SalesEntry[] = [
  { position: 1, previousPosition: 3, trackerTitle: "Dandadan", sourceTitle: "ダンダダン 12", volume: "Volume 12", publisher: "Shueisha", author: "Tatsu Yukinobu", weeklySales: 86420, monthlySales: 214760, yearlySales: 1824610, cumulativeSales: 214760, image: "/mangas/dandadan.jpg", href: "/manga/dandadan" },
  { position: 2, previousPosition: 1, trackerTitle: "MAO", sourceTitle: "MAO 8", volume: "Volume 8", publisher: "Shogakukan", author: "Takahashi Rumiko", weeklySales: 71380, monthlySales: 192440, yearlySales: 1348290, cumulativeSales: 192440, image: "/mangas/mao.jpg", href: "/manga/mao" },
  { position: 3, trackerTitle: "Centuria", sourceTitle: "ケントゥリア 5", volume: "Volume 5", publisher: "Shueisha", author: "Kuramori Tohru", weeklySales: 58920, monthlySales: 146830, yearlySales: 978540, image: "/mangas/centuria.jpg", href: "/manga/centuria" },
  { position: 4, previousPosition: 6, trackerTitle: "InuYasha", sourceTitle: "犬夜叉 新装版 4", volume: "Edição especial 4", publisher: "Shogakukan", author: "Takahashi Rumiko", weeklySales: 44710, monthlySales: 101230, yearlySales: 824690, cumulativeSales: 101230, image: "/mangas/inuyasha.jpg", href: "/manga/inuyasha" },
  { position: 5, previousPosition: 4, trackerTitle: "Ranma ½", sourceTitle: "らんま1/2 38", volume: "Volume 38", publisher: "Shogakukan", author: "Takahashi Rumiko", weeklySales: 39280, monthlySales: 119870, yearlySales: 760310, image: "/mangas/ranma.jpg", href: "/manga/ranma" },
  { position: 6, previousPosition: 6, trackerTitle: "Título aguardando associação", sourceTitle: "星の彼方へ 7 特装版", volume: "Edição especial 7", publisher: "KADOKAWA", author: "佐藤ハル", weeklySales: 31860, monthlySales: 79450, yearlySales: 426780 },
];

const novelEntries: SalesEntry[] = [
  { position: 1, previousPosition: 2, trackerTitle: "Make Heroine ga Oosugiru!", sourceTitle: "負けヒロインが多すぎる！ 9", volume: "Volume 9", publisher: "Shogakukan", author: "Amamori Takibi", weeklySales: 28450, monthlySales: 71320, yearlySales: 548920, cumulativeSales: 71320, image: "/light-novels/make-heroine.jpg", href: "/light-novel/make-heroine-ga-oosugiru" },
  { position: 2, previousPosition: 1, trackerTitle: "86: Eighty-Six", sourceTitle: "86―エイティシックス― 15", volume: "Volume 15", publisher: "KADOKAWA", author: "Asato Asato", weeklySales: 24180, monthlySales: 68490, yearlySales: 492760, cumulativeSales: 68490 },
  { position: 3, trackerTitle: "Kusuriya no Hitorigoto", sourceTitle: "薬屋のひとりごと 17", volume: "Volume 17", publisher: "Shufunotomo", author: "Hyuuga Natsu", weeklySales: 20970, monthlySales: 52740, yearlySales: 418350 },
  { position: 4, previousPosition: 7, trackerTitle: "Re:Zero", sourceTitle: "Re:ゼロから始める異世界生活 41", volume: "Volume 41", publisher: "KADOKAWA", author: "Nagatsuki Tappei", weeklySales: 17640, monthlySales: 43820, yearlySales: 376210, cumulativeSales: 43820 },
  { position: 5, previousPosition: 5, trackerTitle: "Título aguardando associação", sourceTitle: "静かな魔法使いの休日 3", volume: "Volume 3", publisher: "TO Books", author: "水原ユキ", weeklySales: 12110, monthlySales: 32680, yearlySales: 218940 },
];

const weeks = [
  { label: "13–19 Jul", value: "2026-07-27" },
  { label: "06–12 Jul", value: "2026-07-20" },
  { label: "29 Jun–05 Jul", value: "2026-07-13" },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function rankingHref(category: Category, week: string) {
  if (category === "manga" && week === weeks[0].value) return "/ranking-oricon";

  const params = new URLSearchParams();
  if (category !== "manga") params.set("category", category);
  if (week !== weeks[0].value) params.set("week", week);
  return `/ranking-oricon?${params.toString()}`;
}

function PositionChange({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return <span className={styles.newPosition}>Novo</span>;

  const difference = previous - current;
  if (difference > 0) return <span className={styles.positionUp}><FiArrowUp aria-hidden="true" />{difference}</span>;
  if (difference < 0) return <span className={styles.positionDown}><FiArrowDown aria-hidden="true" />{Math.abs(difference)}</span>;
  return <span className={styles.positionSame}><FiMinus aria-hidden="true" /></span>;
}

function Cover({ entry }: { entry: SalesEntry }) {
  if (entry.image) {
    return <Image className={styles.cover} src={entry.image} alt={`Capa de ${entry.trackerTitle}`} width={62} height={88} />;
  }

  return <span className={styles.coverPlaceholder}><RiBookShelfLine aria-hidden="true" /><small>Sem capa</small></span>;
}

async function OriconRankingPage({ searchParams }: { searchParams: Promise<{ category?: string; week?: string }> }) {
  const query = await searchParams;
  const category: Category = query.category === "light-novel" ? "light-novel" : "manga";
  const selectedWeek = weeks.some((week) => week.value === query.week) ? query.week! : weeks[0].value;
  const entries = category === "manga" ? mangaEntries : novelEntries;
  const sourceUrl = category === "manga"
    ? "https://www.oricon.co.jp/rank/obc/w/2026-07-27/"
    : "https://www.oricon.co.jp/rank/obl/w/2026-07-20/";
  const totalWeeklySales = entries.reduce((total, entry) => total + entry.weeklySales, 0);
  const matchedEntries = entries.filter((entry) => entry.image || entry.href).length;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}><RiBarChartBoxLine aria-hidden="true" />Ranking semanal de vendas</span>
            <h1>Ranking Oricon</h1>
            <p>Acompanhe os volumes mais vendidos no Japão e sua movimentação semanal.</p>
          </div>
          <span className={styles.demoBadge}><FiInfo aria-hidden="true" />Dados demonstrativos</span>
        </header>

        <div className={styles.controls}>
          <nav className={styles.categoryTabs} aria-label="Categoria do ranking">
            <Link className={category === "manga" ? styles.categoryActive : undefined} href={rankingHref("manga", selectedWeek)}>
              <GiEvilBook aria-hidden="true" />Manga
            </Link>
            <Link className={category === "light-novel" ? styles.categoryActive : undefined} href={rankingHref("light-novel", selectedWeek)}>
              <LuBookHeart aria-hidden="true" />Light novel
            </Link>
          </nav>
          <div className={styles.weekSelector}>
            <FiCalendar aria-hidden="true" />
            <span>Semana</span>
            {weeks.map((week) => (
              <Link className={selectedWeek === week.value ? styles.weekActive : undefined} href={rankingHref(category, week.value)} key={week.value}>{week.label}</Link>
            ))}
            <FiChevronDown aria-hidden="true" />
          </div>
        </div>

        <section className={styles.editionSummary} aria-labelledby="edition-title">
          <div className={styles.editionHeading}>
            <span className={styles.editionIcon}>{category === "manga" ? <GiEvilBook aria-hidden="true" /> : <LuBookHeart aria-hidden="true" />}</span>
            <div><span>Edição de 27 de julho de 2026</span><h2 id="edition-title">{category === "manga" ? "Ranking semanal de comics" : "Ranking semanal de light novels"}</h2><p>Período de apuração demonstrado: 13 a 19 de julho de 2026</p></div>
          </div>
          <div className={styles.summaryStats}>
            <div><strong>{entries.length}</strong><span>Posições exibidas</span></div>
            <div><strong>{formatNumber(totalWeeklySales)}</strong><span>Vendas na amostra</span></div>
            <div><strong>{matchedEntries}/{entries.length}</strong><span>Obras identificadas</span></div>
          </div>
        </section>

        <aside className={styles.notice}>
          <FiInfo aria-hidden="true" />
          <p><strong>Protótipo visual:</strong> títulos, posições e números abaixo são dados fictícios usados para demonstrar a interface. Em uma integração futura, a página consultará somente o banco do OtakuList.</p>
        </aside>

        <section className={styles.rankingPanel} aria-labelledby="list-title">
          <div className={styles.rankingHeading}>
            <div><span className={styles.sectionKicker}>Vendas estimadas</span><h2 id="list-title">Top semanal</h2></div>
            <Link href={sourceUrl} target="_blank" rel="noreferrer">Consultar página da fonte<FiExternalLink aria-hidden="true" /></Link>
          </div>

          <div className={styles.tableHeader} aria-hidden="true">
            <span>Posição</span><span>Obra e volume</span><span>Editora e créditos</span><span>Estimativas do OtakuList</span><span>Total do volume</span>
          </div>

          <ol className={styles.rankingList}>
            {entries.map((entry) => (
              <li key={`${entry.position}-${entry.sourceTitle}`}>
                <div className={styles.rankingRow}>
                  <span className={styles.positionBlock}><strong>{String(entry.position).padStart(2, "0")}</strong><PositionChange current={entry.position} previous={entry.previousPosition} /></span>
                  <div className={styles.identityBlock}>
                    <Cover entry={entry} />
                    <div>
                      {entry.href ? <Link href={entry.href}>{entry.trackerTitle}</Link> : <strong>{entry.trackerTitle}</strong>}
                      <span className={styles.matchState}>{entry.href ? "Associado ao catálogo" : "Aguardando associação"}</span>
                      <small lang="ja">{entry.sourceTitle}</small>
                      <em>{entry.volume}</em>
                    </div>
                  </div>
                  <span className={styles.publisherBlock}><strong>{entry.publisher}</strong><small>{entry.author}</small></span>
                  <span className={styles.salesBlock}>
                    <span><small>Semana</small><strong>{formatNumber(entry.weeklySales)}</strong></span>
                    <span><small>Julho</small><strong>{formatNumber(entry.monthlySales)}</strong></span>
                    <span><small>2026</small><strong>{formatNumber(entry.yearlySales)}</strong></span>
                  </span>
                  <span className={styles.cumulativeBlock}>{entry.cumulativeSales ? <><strong>{formatNumber(entry.cumulativeSales)}</strong><small>desde o lançamento · fonte</small></> : <><strong>—</strong><small>não informado pela fonte</small></>}</span>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.rankingFooter}>
            <span>Exibindo {entries.length} posições desta demonstração</span>
            <button type="button">Carregar mais posições<FiChevronDown aria-hidden="true" /></button>
          </div>
        </section>

        <footer className={styles.attribution}>
          <FiTrendingUp aria-hidden="true" />
          <p>Modelo para dados de vendas estimadas publicados pela Oricon. A disponibilidade técnica dos dados não representa autorização automática para coleta ou republicação.</p>
          <Link href={sourceUrl} target="_blank" rel="noreferrer">Oricon News<FiExternalLink aria-hidden="true" /></Link>
        </footer>
      </div>
    </main>
  );
}

export default OriconRankingPage;
