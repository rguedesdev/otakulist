// Imports Principais
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ReviewAction, type ReviewTarget } from "./ReviewAction";

// Style Sheet CSS
import styles from "./formatsidebar.module.css";

import type { EntityInfo } from "@/shared/types/entities";
import {
  hasPersonRole,
  hasVisiblePersonalDetails,
  isAnime,
  isPerson,
  isWork,
  mediumLabels,
} from "@/shared/types/entities";

import { HiOutlineLink } from "react-icons/hi";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaSpotify } from "react-icons/fa6";
import { PiTidalLogoFill } from "react-icons/pi";
import { SiDeezer } from "react-icons/si";

import { GrAmazon } from "react-icons/gr";
import { SiCrunchyroll } from "react-icons/si";
import { SiNetflix } from "react-icons/si";

import { FiEdit } from "react-icons/fi";
import { RiBilibiliLine } from "react-icons/ri";

import { SiRakuten } from "react-icons/si";
import { SiShopee } from "react-icons/si";

type MusicPlatformLinksProps = {
  spotify?: string;
  tidal?: string;
  deezer?: string;
  amazonMusic?: string;
};

function MusicPlatformLinks({ spotify, tidal, deezer, amazonMusic }: MusicPlatformLinksProps) {
  return (
    <div className={styles.musicStreamingLinks}>
      <h3 className={styles.musicStreamingLinksTitle}>Ouça em</h3>
      {spotify && (
        <Link className={styles.linkSpotify} href={spotify}>
          <span className={styles.iconSpotifyContainer}>
            <FaSpotify className={styles.iconSpotify} size={16} />
          </span>
          <span className={styles.linkText}>Spotify</span>
        </Link>
      )}

      {tidal && (
        <Link className={styles.linkTidal} href={tidal}>
          <span className={styles.iconTidalContainer}>
            <PiTidalLogoFill className={styles.iconTidal} size={16} />
          </span>
          <span className={styles.linkText}>Tidal</span>
        </Link>
      )}

      {deezer && (
        <Link className={styles.linkDeezer} href={deezer}>
          <span className={styles.iconDeezerContainer}>
            <SiDeezer className={styles.iconDeezer} size={14} />
          </span>
          <span className={styles.linkText}>Deezer</span>
        </Link>
      )}

      {amazonMusic && (
        <Link className={styles.linkAmazonMusic} href={amazonMusic}>
          <span className={styles.iconAmazonMusicContainer}>
            <GrAmazon className={styles.iconAmazonMusic} size={16} />
          </span>
          <span className={styles.linkText}>Amazon Music</span>
        </Link>
      )}
    </div>
  );
}

type FormatSidebarInfoProps = {
  entity: EntityInfo;
  children?: ReactNode;
  reviewTarget?: ReviewTarget;
};

function FormatSidebarInfo({
  entity,
  children,
  reviewTarget,
}: FormatSidebarInfoProps) {
  const externalLinkItems = [
    { href: entity.externalLinks?.website, label: "Site Oficial", className: styles.linkWebsite, iconClassName: styles.iconWebsiteContainer, icon: <HiOutlineLink className={styles.iconWebsite} size={16} /> },
    { href: entity.externalLinks?.x, label: "X/Twitter", className: styles.linkXTwitter, iconClassName: styles.iconXTwitterContainer, icon: <FaXTwitter className={styles.iconXTwitter} size={16} /> },
    { href: entity.externalLinks?.instagram, label: "Instagram", className: styles.linkInstagram, iconClassName: styles.iconInstagramContainer, icon: <FaInstagram className={styles.iconInstagram} size={18} /> },
    { href: entity.externalLinks?.pixiv, label: "Pixiv", className: styles.linkPixiv, iconClassName: styles.iconPixivContainer, icon: <Image src="/social-medias/pixiv.jpg" alt="" width={20} height={20} /> },
    { href: entity.externalLinks?.youtube, label: "YouTube", className: styles.linkYoutube, iconClassName: styles.iconYoutubeContainer, icon: <FaYoutube className={styles.iconYoutube} size={16} /> },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href));

  const streamingLinkItems = isAnime(entity)
    ? [
        { href: entity.streamingLinks?.crunchyroll, label: "Crunchyroll", className: styles.linkCrunchroll, iconClassName: styles.iconlinkCrunchrollContainer, icon: <SiCrunchyroll className={styles.iconlinkCrunchroll} size={16} /> },
        { href: entity.streamingLinks?.netflix, label: "Netflix", className: styles.linkNetflix, iconClassName: styles.iconlinkNetflixContainer, icon: <SiNetflix style={{ color: "#E50914" }} className={styles.iconlinkNetflix} size={16} /> },
        { href: entity.streamingLinks?.primeVideo, label: "Prime Video", className: styles.linkPrimeVideo, iconClassName: styles.iconlinkPrimeVideoContainer, icon: <GrAmazon className={styles.iconlinkPrimeVideo} size={16} /> },
        { href: entity.streamingLinks?.bilibili, label: "BiliBili", className: styles.linkBiliBili, iconClassName: styles.iconlinkBiliBiliContainer, icon: <RiBilibiliLine className={styles.iconlinkBiliBili} size={18} /> },
        { href: entity.streamingLinks?.retrocrush, label: "RetroCrush", className: styles.linkRetroCrush, iconClassName: styles.iconlinkRetroCrushContainer, icon: <Image src="/streamings/retrocrush.png" alt="" width={20} height={20} /> },
        { href: entity.streamingLinks?.hulu, label: "Hulu", className: styles.linkHulu, iconClassName: styles.iconlinkHuluContainer, icon: <Image src="/streamings/hulu.png" alt="" width={18} height={18} /> },
        { href: entity.streamingLinks?.hidive, label: "HiDive", className: styles.linkHiDive, iconClassName: styles.iconlinkHiDiveContainer, icon: <Image src="/streamings/hidive.png" alt="" width={18} height={18} /> },
        { href: entity.streamingLinks?.uNext, label: "U-Next", className: styles.linkUNext, iconClassName: styles.iconlinkUNextContainer, icon: <Image src="/streamings/u-next.png" alt="" width={16} height={16} /> },
        { href: entity.streamingLinks?.abemaTv, label: "Abema TV", className: styles.linkAbemaTV, iconClassName: styles.iconlinkAbemaTVContainer, icon: <Image src="/streamings/abematv.png" alt="" width={16} height={16} /> },
        { href: entity.streamingLinks?.adn, label: "Anime Digital Network", className: styles.linkADN, iconClassName: styles.iconlinkADNContainer, icon: <Image src="/streamings/adn.png" alt="" width={20} height={20} /> },
        { href: entity.streamingLinks?.museAsia, label: "Muse Asia", className: styles.linkMuseAsia, iconClassName: styles.iconlinkMuseAsiaContainer, icon: <Image src="/streamings/muse-asia.png" alt="" width={22} height={22} /> },
        { href: entity.streamingLinks?.laftel, label: "Laftel TV", className: styles.linkLaftel, iconClassName: styles.iconlinkLaftelContainer, icon: <Image src="/streamings/laftel.png" alt="" width={22} height={22} /> },
        { href: entity.streamingLinks?.tver, label: "TVer", className: styles.linkTVer, iconClassName: styles.iconlinkTVerContainer, icon: <Image src="/streamings/tver.png" alt="" width={18} height={18} /> },
        { href: entity.streamingLinks?.iqiyi, label: "iQIYI", className: styles.linkIQIYI, iconClassName: styles.iconlinkIQIYIContainer, icon: <Image src="/streamings/iQIYI.png" alt="" width={20} height={20} /> },
        { href: entity.streamingLinks?.tubi, label: "Tubi", className: styles.linkTubi, iconClassName: styles.iconlinkTubiContainer, icon: <Image src="/streamings/tubi.png" alt="" width={20} height={20} /> },
        { href: entity.streamingLinks?.dAnimeStore, label: "d Anime Store", className: styles.linkDAnime, iconClassName: styles.iconlinkDAnimeContainer, icon: <Image src="/streamings/danime-store.png" alt="" width={12} height={12} /> },
      ].filter((item): item is typeof item & { href: string } => Boolean(item.href))
    : [];
  const storeLinkItems = isWork(entity)
    ? [
        { href: entity.storeLinks?.amazon, label: "Amazon", className: styles.linkAmazonStore, iconClassName: styles.iconlinkAmazonStoreContainer, icon: <GrAmazon className={styles.iconlinkAmazonStore} size={16} /> },
        { href: entity.storeLinks?.cdJapan, label: "CD Japan", className: styles.linkCDJapan, iconClassName: styles.iconlinkCDJapanContainer, icon: <Image src="/store/cdjapan.png" alt="" width={20} height={20} /> },
        { href: entity.storeLinks?.mercadoLivre, label: "Mercado Livre", className: styles.linkMercadoLivre, iconClassName: styles.iconlinkMercadoLivreContainer, icon: <Image src="/store/mercado-livre.png" alt="" width={22} height={22} /> },
        { href: entity.storeLinks?.rakuten, label: "Rakuten", className: styles.linkRakuten, iconClassName: styles.iconlinkRakutenContainer, icon: <SiRakuten className={styles.iconlinkRakuten} size={16} /> },
        { href: entity.storeLinks?.shopee, label: "Shopee", className: styles.linkShopee, iconClassName: styles.iconlinkShopeeContainer, icon: <SiShopee className={styles.iconlinkShopee} size={16} /> },
        { href: entity.storeLinks?.ebay, label: "Ebay", className: styles.linkEbay, iconClassName: styles.iconlinkEbayContainer, icon: <Image src="/store/ebay.png" alt="" width={16} height={16} /> },
        { href: entity.storeLinks?.otakuyasan, label: "Otakuya-san", className: styles.linkOtakuyasan, iconClassName: styles.iconlinkOtakuyasanContainer, icon: <Image src="/store/otakuyasan.png" alt="" width={22} height={22} /> },
        { href: entity.storeLinks?.hmv, label: "HMV & Books", className: styles.linkHMV, iconClassName: styles.iconlinkHMVContainer, icon: <Image src="/store/hmv.png" alt="" width={22} height={22} /> },
        { href: entity.storeLinks?.honto, label: "Honto", className: styles.linkHonto, iconClassName: styles.iconlinkHontoContainer, icon: <Image src="/store/honto.png" alt="" width={22} height={22} /> },
        { href: entity.storeLinks?.toranoana, label: "Toranoana", className: styles.linkToranoana, iconClassName: styles.iconlinkToranoanaContainer, icon: <Image src="/store/toranoana.png" alt="" width={22} height={22} /> },
        { href: entity.storeLinks?.animate, label: "Animate", className: styles.linkAnimate, iconClassName: styles.iconlinkAnimateContainer, icon: <Image src="/store/animate.jpg" alt="" width={22} height={22} /> },
      ].filter((item): item is typeof item & { href: string } => Boolean(item.href))
    : [];

  return (
    <aside className={styles.sidebarWrapper}>
      {/* Bloco 2: Card de Informações Tradicional */}
      <div className={styles.infoCard}>
        <dl className={styles.animeDescriptionList}>
          {isWork(entity) ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Mídia</dt>
              <dd className={styles.animeDescriptionDetail}>
                {mediumLabels[entity.medium]}
              </dd>

            </>
          ) : (
            <></>
          )}

          {entity.entityType === "publication" ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Tipo</dt>
              <dd className={styles.animeDescriptionDetail}>Magazine</dd>
            </>
          ) : (
            <></>
          )}

          {hasVisiblePersonalDetails(entity) ? (
            <>
              <>
                <dt className={styles.animeDescriptionTerm}>Nome em Kanji</dt>
                <dd className={styles.animeDescriptionDetail}>
                  {entity.name_kanji}
                </dd>

                <dt className={styles.animeDescriptionTerm}>Nome em Romaji</dt>
                <dd className={styles.animeDescriptionDetail}>
                  {entity.name_romaji}
                </dd>

                <dt className={styles.animeDescriptionTerm}>
                  Data de Nascimento
                </dt>
                <dd className={styles.animeDescriptionDetail}>
                  {entity.date_of_birth}
                </dd>

                <dt className={styles.animeDescriptionTerm}>Cidade Natal</dt>
                <dd className={styles.animeDescriptionDetail}>
                  {entity.hometown}
                </dd>

                {hasPersonRole(entity, "seiyuu") && "agency" in entity && (
                  <>
                    <dt className={styles.animeDescriptionTerm}>Agência</dt>
                    <dd className={styles.animeDescriptionDetail}>
                      {entity.agency}
                    </dd>
                  </>
                )}

                {hasPersonRole(entity, "artist") && "activity_period" in entity && (
                  <>
                    <dt className={styles.animeDescriptionTerm}>
                      Período de atividade
                    </dt>
                    <dd className={styles.animeDescriptionDetail}>
                      {entity.activity_period}
                    </dd>

                    <dt className={styles.animeDescriptionTerm}>Gravadora</dt>
                    <dd className={styles.animeDescriptionDetail}>
                      {entity.record_label}
                    </dd>

                    <dt className={styles.animeDescriptionTerm}>
                      Gêneros musicais
                    </dt>
                    <dd className={styles.animeDescriptionDetail}>
                      {entity.musical_genres?.join(", ")}
                    </dd>
                  </>
                )}

                {isPerson(entity) && (hasPersonRole(entity, "staff") || hasPersonRole(entity, "mangaka")) && entity.activity_period && (
                  <>
                    <dt className={styles.animeDescriptionTerm}>Período de atividade</dt>
                    <dd className={styles.animeDescriptionDetail}>{entity.activity_period}</dd>
                  </>
                )}

                {isPerson(entity) && entity.occupations?.length ? (
                  <>
                    <dt className={styles.animeDescriptionTerm}>Atuação</dt>
                    <dd className={styles.animeDescriptionDetail}>{entity.occupations.join(", ")}</dd>
                  </>
                ) : null}
              </>
            </>
          ) : (
            <></>
          )}

          {entity.entityType === "music_artist" && (
            <>
              <dt className={styles.animeDescriptionTerm}>Tipo</dt>
              <dd className={styles.animeDescriptionDetail}>{entity.artist_kind === "band" ? "Banda" : "Artista solo"}</dd>
              {entity.name_kanji && <><dt className={styles.animeDescriptionTerm}>Nome em Kanji</dt><dd className={styles.animeDescriptionDetail}>{entity.name_kanji}</dd></>}
              {entity.date_of_birth && <><dt className={styles.animeDescriptionTerm}>Data de Nascimento</dt><dd className={styles.animeDescriptionDetail}>{entity.date_of_birth}</dd></>}
              {entity.origin && <><dt className={styles.animeDescriptionTerm}>Origem</dt><dd className={styles.animeDescriptionDetail}>{entity.origin}</dd></>}
              {entity.activity_period && <><dt className={styles.animeDescriptionTerm}>Período de atividade</dt><dd className={styles.animeDescriptionDetail}>{entity.activity_period}</dd></>}
              {entity.record_label && <><dt className={styles.animeDescriptionTerm}>Gravadora</dt><dd className={styles.animeDescriptionDetail}>{entity.record_label}</dd></>}
              {entity.musical_genres?.length ? <><dt className={styles.animeDescriptionTerm}>Gêneros musicais</dt><dd className={styles.animeDescriptionDetail}>{entity.musical_genres.join(", ")}</dd></> : null}
            </>
          )}

          {entity.entityType === "organization" ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Tipo</dt>
              <dd className={styles.animeDescriptionDetail}>{entity.organizationType === "publisher" ? "Editora" : "Estúdio"}</dd>
            </>
          ) : null}

          {isWork(entity) && entity.medium !== "anime" && entity.status ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Status</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.status}
              </dd>
            </>
          ) : (
            <></>
          )}

          {isWork(entity) ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Início</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.start}
              </dd>
              <dt className={styles.animeDescriptionTerm}>Término</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.end}
              </dd>
            </>
          ) : (
            <></>
          )}

          {"publisher" in entity && entity.publisher ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Editora</dt>
              <dd className={styles.animeDescriptionDetail}>
                {"publisherLink" in entity && entity.publisherLink
                  ? <Link className={styles.publisherLink} href={`/publisher/${entity.publisherLink.slug}`}>{entity.publisher}</Link>
                  : entity.publisher}
              </dd>
            </>
          ) : (
            <></>
          )}

          {entity.entityType === "publication" ||
          entity.entityType === "organization" ? (
            <>
              <dt className={styles.animeDescriptionTerm}>
                {entity.entityType === "publication" && entity.publicationType === "magazine"
                  ? "Ano de criação"
                  : "Fundado em"}
              </dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.foundation}
              </dd>
            </>
          ) : (
            <></>
          )}

          {isAnime(entity) && entity.season ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Temporada</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.season}
              </dd>
            </>
          ) : (
            <></>
          )}

          {isAnime(entity) && entity.studio ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Estúdios</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.studioLinks?.length
                  ? entity.studioLinks.map((studio, index) => <span key={`${studio.slug ?? "legacy"}-${studio.displayName}`}>{index > 0 && ", "}{studio.slug ? <Link className={styles.publisherLink} href={`/studio/${studio.slug}`}>{studio.displayName}</Link> : studio.displayName}</span>)
                  : entity.studio}
              </dd>
            </>
          ) : (
            <></>
          )}

          {entity.entityType === "organization" && entity.name_kanji ? (
            <><dt className={styles.animeDescriptionTerm}>Nome em Kanji</dt><dd className={styles.animeDescriptionDetail}>{entity.name_kanji}</dd></>
          ) : <></>}

          {entity.entityType === "organization" && entity.headquarters ? (
            <><dt className={styles.animeDescriptionTerm}>Sede</dt><dd className={styles.animeDescriptionDetail}>{entity.headquarters}</dd></>
          ) : <></>}

          {isAnime(entity) && entity.producers.length > 0 ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Produtores</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.producers.join(", ")}
              </dd>
            </>
          ) : (
            <></>
          )}

          {isWork(entity) && entity.medium === "manga" && entity.magazine ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Magazine</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.magazineLink
                  ? <Link className={styles.magazineLink} href={`/magazine/${entity.magazineLink.slug}`}>{entity.magazine}</Link>
                  : entity.magazine}
              </dd>
            </>
          ) : (
            <></>
          )}

          {isWork(entity) && entity.source ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Origem</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.source}
              </dd>
            </>
          ) : (
            <></>
          )}

          {entity.entityType === "publication" ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Demografia</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.demography}
              </dd>

              <dt className={styles.animeDescriptionTerm}>Periodicidade</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.frequency}
              </dd>
            </>
          ) : (
            <></>
          )}

          {isWork(entity) && entity.genders ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Gênero</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.genders.join(", ")}
              </dd>
            </>
          ) : (
            <></>
          )}

          {isWork(entity) && (entity.medium === "anime" || entity.medium === "manga") && entity.demography ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Demografia</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.demography}
              </dd>
            </>
          ) : (
            <></>
          )}

          {isAnime(entity) ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Classificação</dt>
              <dd className={styles.animeDescriptionDetail}>
                {entity.rating}
              </dd>
            </>
          ) : (
            <></>
          )}
        </dl>
      </div>

      {externalLinkItems.length > 0 && (
        <div className={styles.relatedLinks}>
          <h3 className={styles.relatedLinksTitle}>Links Relacionados</h3>
          {externalLinkItems.map((item) => (
            <Link className={item.className} href={item.href} key={item.label} target="_blank" rel="noreferrer">
              <span className={item.iconClassName}>{item.icon}</span>
              <span className={styles.linkText}>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {children}

      {streamingLinkItems.length > 0 && (
        <div className={styles.streamingsLinks}>
          <h3 className={styles.streamingsLinksTitle}>Assista em</h3>
          {streamingLinkItems.map((item) => (
            <Link className={item.className} href={item.href} key={item.label} target="_blank" rel="noreferrer">
              <span className={item.iconClassName}>{item.icon}</span>
              <span className={styles.linkText}>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {storeLinkItems.length > 0 && (
        <div className={styles.storeLinks}>
          <h3 className={styles.storeLinksTitle}>Compre em</h3>
          {storeLinkItems.map((item) => (
            <Link className={item.className} href={item.href} key={item.label} target="_blank" rel="noreferrer">
              <span className={item.iconClassName}>{item.icon}</span>
              <span className={styles.linkText}>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {isWork(entity) && (
        <div className={styles.reviewEdit}>
          <h3 className={styles.reviewEditTitle}>Colaborar</h3>
          {reviewTarget && <ReviewAction target={reviewTarget} />}
          <button className={styles.btnEdit} type="button">
            <span className={styles.iconbtnEditContainer}>
              <FiEdit className={styles.iconbtnEdit} size={16} />
            </span>
            <span className={styles.linkText}>Editar</span>
          </button>
        </div>
      )}
    </aside>
  );
}

export { FormatSidebarInfo, MusicPlatformLinks };
