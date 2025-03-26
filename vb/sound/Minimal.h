#ifndef MINIMAL_H_
#define MINIMAL_H_

// TYPES

typedef unsigned char		uint8;
typedef unsigned short 		uint16;
typedef unsigned int 		uint32;
typedef unsigned long long	uint64;

typedef signed char 		int8;
typedef signed short 		int16;
typedef signed int	 		int32;
typedef signed long long 	int64;

typedef uint8		 		BYTE;
typedef uint16		 		HWORD;
typedef uint32		 		WORD;

typedef uint8				bool;
enum { false, true };

#define NULL 				(void *)0x00000000

// ENUMS

enum SoundEvents
{
	kSoundTrackEventEnd = 1 << (0),
	kSoundTrackEventStart = 1 << (1),
	kSoundTrackEventSxINT = 1 << (2),
	kSoundTrackEventSxLRV = 1 << (3),
	kSoundTrackEventSxFQ = 1 << (4),
	kSoundTrackEventSxEV0 = 1 << (5),
	kSoundTrackEventSxEV1 = 1 << (6),
	kSoundTrackEventSxRAM = 1 << (7),
	kSoundTrackEventSxSWP = 1 << (8),
	kSoundTrackEventSxMOD = 1 << (9),
	kSoundTrackEventSweepMod = 1 << (10),
	kSoundTrackEventNoise = 1 << (11)
};

enum SoundTrackTypes
{
	kTrackNative = 0,
	kTrackPCM
};

// SOUND TRACK KEYFRAME

typedef struct SoundTrackKeyframe
{
	uint16 tick;
	uint16 events;

} SoundTrackKeyframe;

// SOUND TRACK SPEC

typedef struct SoundTrackSpec
{
	uint32 trackType;
	bool skippable;
	uint32 samples;
	SoundTrackKeyframe* trackKeyframes;
	uint8* SxINT;
	uint8* SxLRV;
	uint16* SxFQ;
	uint8* SxEV0;
	uint8* SxEV1;
	int8** SxRAM;
	uint8* SxSWP;
	int8** SxMOD;
} SoundTrackSpec;

typedef const SoundTrackSpec SoundTrackROMSpec;

// SOUND SPEC

typedef struct SoundSpec
{
	char* name;
	bool loop;
	uint16 targetTimerResolutionUS;
	SoundTrackSpec** soundTrackSpecs;
} SoundSpec;

typedef const SoundSpec SoundROMSpec;

#endif
