import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import type { CertificateData } from "@/lib/certificate/types";
import { DottedBackground } from "@/lib/certificate/dotted-background";
import { formatCertificateDate } from "@/lib/certificate/format-date";

const NAVY = "#0B1E3F";
const GOLD = "#D4AF37";
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const OUTER_MARGIN = 15;
const OUTER_BORDER = 3;
const INNER_MARGIN_FROM_PAGE = 22;
const INNER_BORDER = 1;
const CORNER_SIZE = 8;
const CORNER_OFFSET = CORNER_SIZE / 2;

const innerFrameMargin =
  INNER_MARGIN_FROM_PAGE - OUTER_MARGIN - OUTER_BORDER;

const styles = StyleSheet.create({
  page: {
    backgroundColor: NAVY,
    fontFamily: "NotoSans",
    padding: 0,
  },
  root: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    position: "relative",
  },
  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  outerBorder: {
    margin: OUTER_MARGIN,
    width: PAGE_WIDTH - OUTER_MARGIN * 2,
    height: PAGE_HEIGHT - OUTER_MARGIN * 2,
    borderWidth: OUTER_BORDER,
    borderColor: GOLD,
    position: "relative",
  },
  cornerSquare: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    backgroundColor: GOLD,
  },
  cornerTopLeft: {
    top: -CORNER_OFFSET,
    left: -CORNER_OFFSET,
  },
  cornerTopRight: {
    top: -CORNER_OFFSET,
    right: -CORNER_OFFSET,
  },
  cornerBottomLeft: {
    bottom: -CORNER_OFFSET,
    left: -CORNER_OFFSET,
  },
  cornerBottomRight: {
    bottom: -CORNER_OFFSET,
    right: -CORNER_OFFSET,
  },
  innerBorder: {
    margin: innerFrameMargin,
    flex: 1,
    borderWidth: INNER_BORDER,
    borderColor: GOLD,
    paddingHorizontal: 48,
    paddingBottom: 36,
    display: "flex",
    flexDirection: "column",
  },
  qrCode: {
    position: "absolute",
    top: 24,
    right: 0,
    width: 68,
    height: 68,
    backgroundColor: "#FFFFFF",
    padding: 4,
  },
  topSection: {
    paddingTop: 37,
    alignItems: "center",
    paddingRight: 80,
  },
  brand: {
    fontSize: 28,
    fontWeight: 700,
    color: GOLD,
    textAlign: "center",
  },
  topDivider: {
    width: "100%",
    height: 1,
    backgroundColor: GOLD,
    marginTop: 16,
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  certificateTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
  },
  centerSpacer: {
    height: 32,
  },
  certifyLead: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  participantName: {
    fontSize: 24,
    fontWeight: 700,
    color: GOLD,
    textAlign: "center",
    marginBottom: 12,
  },
  certifyFollow: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  courseNameWrapper: {
    alignItems: "center",
    marginTop: 4,
  },
  courseNameLine: {
    width: 200,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.75,
  },
  courseNameDiamond: {
    marginVertical: 6,
  },
  courseName: {
    fontFamily: "NotoSans",
    fontSize: 28,
    fontWeight: 700,
    fontStyle: "italic",
    color: GOLD,
    textAlign: "center",
    letterSpacing: 2,
    maxWidth: 580,
    marginVertical: 4,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: GOLD,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brandSignature: {
    fontSize: 18,
    fontWeight: 700,
    color: GOLD,
  },
  completionDate: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "right",
  },
});

function CornerDecorations() {
  return (
    <>
      <View style={[styles.cornerSquare, styles.cornerTopLeft]} />
      <View style={[styles.cornerSquare, styles.cornerTopRight]} />
      <View style={[styles.cornerSquare, styles.cornerBottomLeft]} />
      <View style={[styles.cornerSquare, styles.cornerBottomRight]} />
    </>
  );
}

function GoldDiamond() {
  return (
    <Svg width={8} height={8} viewBox="0 0 8 8" style={styles.courseNameDiamond}>
      <Path d="M4,0 L8,4 L4,8 L0,4 Z" fill={GOLD} />
    </Svg>
  );
}

function ArtisticCourseName({ title }: { title: string }) {
  return (
    <View style={styles.courseNameWrapper}>
      <View style={styles.courseNameLine} />
      <GoldDiamond />
      <Text style={styles.courseName}>{title}</Text>
      <GoldDiamond />
      <View style={styles.courseNameLine} />
    </View>
  );
}

export function CertificateDocument({ data }: { data: CertificateData }) {
  const formattedDate = formatCertificateDate(data.completionDate);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.root}>
          <View style={styles.backgroundLayer}>
            <DottedBackground width={PAGE_WIDTH} height={PAGE_HEIGHT} />
          </View>

          <View style={styles.outerBorder}>
            <CornerDecorations />

            <View style={styles.innerBorder}>
              {data.qrDataUrl ? (
                <Image src={data.qrDataUrl} style={styles.qrCode} />
              ) : null}

              <View style={styles.topSection}>
                <Text style={styles.brand}>THORIUS ACADEMY</Text>
                <View style={styles.topDivider} />
              </View>

              <View style={styles.centerSection}>
                <Text style={styles.certificateTitle}>
                  CERTIFICATE OF PARTICIPATION
                </Text>
                <View style={styles.centerSpacer} />
                <Text style={styles.certifyLead}>This is to certify that</Text>
                <Text style={styles.participantName}>{data.fullName}</Text>
                <Text style={styles.certifyFollow}>
                  has successfully completed the course
                </Text>
                <ArtisticCourseName title={data.courseTitle} />
              </View>

              <View style={styles.bottomSection}>
                <Text style={styles.brandSignature}>Thorius</Text>
                <Text style={styles.completionDate}>
                  Date of Completion: {formattedDate}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
