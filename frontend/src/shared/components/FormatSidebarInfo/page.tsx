// Imports Principais
import Link from "next/link";
import Image from "next/image";

// Style Sheet CSS
import styles from "./formatsidebar.module.css";

// Ícone de Estrela para a Nota
import { FaStar } from "react-icons/fa";
import { HiOutlineLink } from "react-icons/hi";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";

import { GrAmazon } from "react-icons/gr";
import { SiCrunchyroll } from "react-icons/si";
import { SiNetflix } from "react-icons/si";

import { MdOutlineRateReview } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { RiBilibiliLine } from "react-icons/ri";

import { SiRakuten } from "react-icons/si";
import { SiShopee } from "react-icons/si";

interface IFormatTranslations {
  anime: string;
  manga: string;
  magazine: string;
  publisher: string;
  light_novel: string;
  studio: string;
}

function FormatSidebarInfo({ FormatInfo }) {
  const formatTranslations: Record<string, string> = {
    anime: "Anime",
    manga: "Manga",
    magazine: "Magazine",
    publisher: "Editora",
    light_novel: "Light Novel",
    studio: "Estúdio",
  };

  return (
    <aside className={styles.sidebarWrapper}>
      {/* Bloco 1: Card de Nota Isolado */}
      {FormatInfo.format == "anime" || FormatInfo.format == "manga" ? (
        <>
          <div className={styles.scoreCard}>
            <span className={styles.scoreTitle}>Score</span>
            <div className={styles.scoreValueContainer}>
              <FaStar
                className={styles.starIcon}
                size={16}
                aria-hidden="true"
              />
              <span className={styles.scoreValue}>6.64</span>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}

      {/* Bloco 2: Card de Informações Tradicional */}
      <div className={styles.infoCard}>
        <dl className={styles.animeDescriptionList}>
          <dt className={styles.animeDescriptionTerm}>Formato</dt>
          <dd className={styles.animeDescriptionDetail}>
            {formatTranslations[FormatInfo.format as keyof IFormatTranslations]}
          </dd>

          {FormatInfo.episodes ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Episódios</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.episodes}
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo.status ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Status</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.status}
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo == "anime" &&
          FormatInfo == "manga" &&
          FormatInfo == "light_novel" ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Ínicio</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.start}
              </dd>
              <dt className={styles.animeDescriptionTerm}>Término</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.end}
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo.publisher ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Editora</dt>
              <dd className={styles.animeDescriptionDetail}>
                <Link className={styles.publisherLink} href={`/`}>
                  {FormatInfo.publisher}
                </Link>
              </dd>
            </>
          ) : (
            <></>
          )}

          <dt className={styles.animeDescriptionTerm}>Fundação</dt>
          <dd className={styles.animeDescriptionDetail}>
            {FormatInfo.foundation}
          </dd>

          {FormatInfo.season ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Temporada</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.season}
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo.studio ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Estúdio</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.studio}
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo.producers ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Produtores</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.producers.join(", ")}
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo.magazine ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Magazine</dt>
              <dd className={styles.animeDescriptionDetail}>
                <Link
                  className={styles.magazineLink}
                  href={`/magazine/shounen-jump`}
                >
                  {FormatInfo.magazine}
                </Link>
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo.source ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Origem</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.source}
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo.format == "magazine" ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Demografia</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.demography}
              </dd>

              <dt className={styles.animeDescriptionTerm}>Periodicidade</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.frequency}
              </dd>
            </>
          ) : (
            <></>
          )}

          {FormatInfo.genders ? (
            <>
              <dt className={styles.animeDescriptionTerm}>Gênero</dt>
              <dd className={styles.animeDescriptionDetail}>
                {FormatInfo.genders.join(", ")}
              </dd>
            </>
          ) : (
            <></>
          )}
        </dl>
      </div>

      {/* Bloco 3: Links úteis */}
      <div className={styles.relatedLinks}>
        <h3 className={styles.relatedLinksTitle}>Links Relacionados</h3>
        <Link className={styles.linkWebsite} href={`/`}>
          <span className={styles.iconWebsiteContainer}>
            <HiOutlineLink className={styles.iconWebsite} size={16} />
          </span>
          <span className={styles.linkText}>Site Oficial</span>
        </Link>

        <Link className={styles.linkXTwitter} href={`/`}>
          <span className={styles.iconXTwitterContainer}>
            <FaXTwitter className={styles.iconXTwitter} size={16} />
          </span>
          <span className={styles.linkText}>X/Twitter</span>
        </Link>

        <Link className={styles.linkYoutube} href={`/`}>
          <span className={styles.iconYoutubeContainer}>
            <FaYoutube className={styles.iconYoutube} size={16} />
          </span>
          <span className={styles.linkText}>YouTube</span>
        </Link>
      </div>

      {FormatInfo.format == "anime" ? (
        <>
          {/* Bloco 4: Streamings Links */}
          <div className={styles.streamingsLinks}>
            <h3 className={styles.streamingsLinksTitle}>Assista em</h3>

            <Link className={styles.linkCrunchroll} href={`/`}>
              <span className={styles.iconlinkCrunchrollContainer}>
                <SiCrunchyroll
                  className={styles.iconlinkCrunchroll}
                  size={16}
                />
              </span>
              <span className={styles.linkText}>Crunchyroll</span>
            </Link>

            <Link className={styles.linkNetflix} href={`/`}>
              <span className={styles.iconlinkNetflixContainer}>
                <SiNetflix
                  style={{ color: "#E50914" }}
                  className={styles.iconlinkNetflix}
                  size={16}
                />
              </span>
              <span className={styles.linkText}>Netflix</span>
            </Link>

            <Link className={styles.linkPrimeVideo} href={`/`}>
              <span className={styles.iconlinkPrimeVideoContainer}>
                <GrAmazon className={styles.iconlinkPrimeVideo} size={16} />
              </span>
              <span className={styles.linkText}>Prime Video</span>
            </Link>

            <Link className={styles.linkBiliBili} href={`/`}>
              <span className={styles.iconlinkBiliBiliContainer}>
                <RiBilibiliLine className={styles.iconlinkBiliBili} size={18} />
              </span>
              <span className={styles.linkText}>BiliBili</span>
            </Link>

            <Link className={styles.linkRetroCrush} href={`/`}>
              <span className={styles.iconlinkRetroCrushContainer}>
                <Image
                  src="/streamings/retrocrush.png"
                  alt="RetroCrush Logo"
                  width={20}
                  height={20}
                />
              </span>
              <span className={styles.linkText}>RetroCrush</span>
            </Link>

            <Link className={styles.linkHulu} href={`/`}>
              <span className={styles.iconlinkHuluContainer}>
                <Image
                  src="/streamings/hulu.png"
                  alt="Hulu Logo"
                  width={18}
                  height={18}
                />
              </span>
              <span className={styles.linkText}>Hulu</span>
            </Link>

            <Link className={styles.linkHiDive} href={`/`}>
              <span className={styles.iconlinkHiDiveContainer}>
                <Image
                  src="/streamings/hidive.png"
                  alt="HiDive Logo"
                  width={18}
                  height={18}
                />
              </span>
              <span className={styles.linkText}>HiDive</span>
            </Link>

            <Link className={styles.linkUNext} href={`/`}>
              <span className={styles.iconlinkUNextContainer}>
                <Image
                  src="/streamings/u-next.png"
                  alt="U-Next Logo"
                  width={16}
                  height={16}
                />
              </span>
              <span className={styles.linkText}>U-Next</span>
            </Link>

            <Link className={styles.linkAbemaTV} href={`/`}>
              <span className={styles.iconlinkAbemaTVContainer}>
                <Image
                  src="/streamings/abematv.png"
                  alt="Abema TV Logo"
                  width={16}
                  height={16}
                />
              </span>
              <span className={styles.linkText}>Abema TV</span>
            </Link>

            <Link className={styles.linkADN} href={`/`}>
              <span className={styles.iconlinkADNContainer}>
                <Image
                  src="/streamings/adn.png"
                  alt="ADN Logo"
                  width={20}
                  height={20}
                />
              </span>
              <span className={styles.linkText}>Anime Digital Network</span>
            </Link>

            <Link className={styles.linkMuseAsia} href={`/`}>
              <span className={styles.iconlinkMuseAsiaContainer}>
                <Image
                  src="/streamings/muse-asia.png"
                  alt="MuseAsia Logo"
                  width={22}
                  height={22}
                />
              </span>
              <span className={styles.linkText}>Muse Asia</span>
            </Link>

            <Link className={styles.linkLaftel} href={`/`}>
              <span className={styles.iconlinkLaftelContainer}>
                <Image
                  src="/streamings/laftel.png"
                  alt="LAftel TV Logo"
                  width={22}
                  height={22}
                />
              </span>
              <span className={styles.linkText}>Laftel TV</span>
            </Link>

            <Link className={styles.linkTVer} href={`/`}>
              <span className={styles.iconlinkTVerContainer}>
                <Image
                  src="/streamings/tver.png"
                  alt="TVer Logo"
                  width={18}
                  height={18}
                />
              </span>
              <span className={styles.linkText}>TVer</span>
            </Link>

            <Link className={styles.linkIQIYI} href={`/`}>
              <span className={styles.iconlinkIQIYIContainer}>
                <Image
                  src="/streamings/iQIYI.png"
                  alt="iQIYI Logo"
                  width={20}
                  height={20}
                />
              </span>
              <span className={styles.linkText}>iQIYI</span>
            </Link>

            <Link className={styles.linkTubi} href={`/`}>
              <span className={styles.iconlinkTubiContainer}>
                <Image
                  src="/streamings/tubi.png"
                  alt="Tubi Logo"
                  width={20}
                  height={20}
                />
              </span>
              <span className={styles.linkText}>Tubi</span>
            </Link>

            <Link className={styles.linkDAnime} href={`/`}>
              <span className={styles.iconlinkDAnimeContainer}>
                <Image
                  src="/streamings/danime-store.png"
                  alt="D Anime Store Logo"
                  width={12}
                  height={12}
                />
              </span>
              <span className={styles.linkText}>d Anime Store</span>
            </Link>
          </div>
        </>
      ) : (
        <></>
      )}

      {/* Bloco 5: Store Links */}
      {FormatInfo.format == "manga" ||
      FormatInfo.format == "light_novel" ||
      FormatInfo.format == "magazine" ? (
        <div className={styles.storeLinks}>
          <h3 className={styles.storeLinksTitle}>Compre em</h3>
          <Link className={styles.linkAmazonStore} href={`/`}>
            <span className={styles.iconlinkAmazonStoreContainer}>
              <GrAmazon className={styles.iconlinkAmazonStore} size={16} />
            </span>
            <span className={styles.linkText}>Amazon</span>
          </Link>
          <Link className={styles.linkCDJapan} href={`/`}>
            <span className={styles.iconlinkCDJapanContainer}>
              <Image
                src="/store/cdjapan.png"
                alt="CD Japan Logo"
                width={20}
                height={20}
              />
            </span>
            <span className={styles.linkText}>CD Japan</span>
          </Link>
          <Link className={styles.linkMercadoLivre} href={`/`}>
            <span className={styles.iconlinkMercadoLivreContainer}>
              <Image
                src="/store/mercado-livre.png"
                alt="Mercado Livre Logo"
                width={22}
                height={22}
              />
            </span>
            <span className={styles.linkText}>Mercado Livre</span>
          </Link>
          <Link className={styles.linkRakuten} href={`/`}>
            <span className={styles.iconlinkRakutenContainer}>
              <SiRakuten className={styles.iconlinkRakuten} size={16} />
            </span>
            <span className={styles.linkText}>Rakuten</span>
          </Link>
          <Link className={styles.linkShopee} href={`/`}>
            <span className={styles.iconlinkShopeeContainer}>
              <SiShopee className={styles.iconlinkShopee} size={16} />
            </span>
            <span className={styles.linkText}>Shopee</span>
          </Link>
          <Link className={styles.linkEbay} href={`/`}>
            <span className={styles.iconlinkEbayContainer}>
              <Image
                src="/store/ebay.png"
                alt="Otakuya-san"
                width={16}
                height={16}
              />
            </span>
            <span className={styles.linkText}>Ebay</span>
          </Link>
          <Link className={styles.linkOtakuyasan} href={`/`}>
            <span className={styles.iconlinkOtakuyasanContainer}>
              <Image
                src="/store/otakuyasan.png"
                alt="Otakuya-san"
                width={22}
                height={22}
              />
            </span>
            <span className={styles.linkText}>Otakuya-san</span>
          </Link>
          <Link className={styles.linkHMV} href={`/`}>
            <span className={styles.iconlinkHMVContainer}>
              <Image src="/store/hmv.png" alt="HMV" width={22} height={22} />
            </span>
            <span className={styles.linkText}>HMV & Books</span>
          </Link>
          <Link className={styles.linkHonto} href={`/`}>
            <span className={styles.iconlinkHontoContainer}>
              <Image
                src="/store/honto.png"
                alt="Honto"
                width={22}
                height={22}
              />
            </span>
            <span className={styles.linkText}>Honto</span>
          </Link>
          <Link className={styles.linkToranoana} href={`/`}>
            <span className={styles.iconlinkToranoanaContainer}>
              <Image
                src="/store/toranoana.png"
                alt="Toranoana"
                width={22}
                height={22}
              />
            </span>
            <span className={styles.linkText}>Toranoana</span>
          </Link>
          <Link className={styles.linkAnimate} href={`/`}>
            <span className={styles.iconlinkAnimateContainer}>
              <Image
                src="/store/animate.jpg"
                alt="Animate"
                width={22}
                height={22}
              />
            </span>
            <span className={styles.linkText}>Animate</span>
          </Link>
        </div>
      ) : (
        <></>
      )}

      {/* Bloco 6: Review e Editar */}
      <div className={styles.reviewEdit}>
        <h3 className={styles.reviewEditTitle}>Colaborar</h3>
        <button className={styles.btnReview}>
          <span className={styles.iconbtnReviewContainer}>
            <MdOutlineRateReview className={styles.iconbtnReview} size={16} />
          </span>
          <span className={styles.linkText}>Review</span>
        </button>

        <button className={styles.btnEdit}>
          <span className={styles.iconbtnEditContainer}>
            <FiEdit className={styles.iconbtnEdit} size={16} />
          </span>
          <span className={styles.linkText}>Editar</span>
        </button>
      </div>
    </aside>
  );
}

export { FormatSidebarInfo };
